/**
 * Quantitative Evaluator - 정량 지표 평가
 *
 * 입력: ExperimentResult (대화 + GT + collected)
 * 출력: QuanEvaluationReport (슬롯별 매칭 결과 + recall)
 *
 * 핵심 도전:
 *  1. GT type 다양 (boolean / date / number / array / string)
 *  2. collected.value 는 모두 문자열 (한국어 표현)
 *  3. baseline 은 collected 가 빈 배열 → LLM-as-Judge 로 추출
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";

import type { ExperimentResult } from "../runExperiment";
import type { CollectedItem, CollectedStatus } from "../ia";

// ============================================================
// Types
// ============================================================

export type SlotMatch =
  | "match"
  | "mismatch"
  | "missing"          // status=unknown 또는 빈 값
  | "unparseable";     // 값이 있지만 정규화 실패

export interface SlotResult {
  slot: string;
  gt_value: unknown;
  predicted_status: CollectedStatus;
  predicted_value: string | null;
  normalized_predicted: unknown;   // 정규화 후 비교에 사용한 값
  match: SlotMatch;
  reason?: string;                  // mismatch 시 설명
}

export interface QuanEvaluationReport {
  case_id: string;
  case_title: string;
  system: string;
  total_slots: number;
  matches: number;
  mismatches: number;
  missing: number;
  unparseable: number;
  recall: number;                    // matches / total_slots
  slot_results: SlotResult[];
  conversation_turns: number;
  end_reason: string;
  evaluated_at: string;
}

// ============================================================
// Boolean 슬롯 정규화 - 한국어 yes/no 키워드
// ============================================================

const POSITIVE_KEYWORDS = [
  "있음", "있어요", "있습니다", "있어",
  "네", "예", "맞아요", "맞습니다",
  "보유", "받았", "받았어요", "받음",
  "했", "했어요", "했습니다", "함", "함요",
  "완료",
];

const NEGATIVE_KEYWORDS = [
  "없음", "없어요", "없습니다", "없어",
  "아니요", "아니에요", "아닙니다", "아니",
  "안 보냄", "안 했어요", "안 했", "안 함",
  "신청 안", "확인 안", "보내지 않",
  "못 받", "못 봤", "못 했", "못함",
  "미신청", "미발송", "미확인",
  // has_moved_out 용 - 아직 거주 중 = false (퇴거 안 함)
  "거주 중", "계속 살", "아직 살",
];

function normalizeBoolean(value: string | null): boolean | null {
  if (!value) return null;
  if (typeof value === "boolean") return value;
  const v = String(value).toLowerCase();
  // 부정 먼저 체크 (긍정 키워드 포함된 부정 표현 우선 처리)
  for (const neg of NEGATIVE_KEYWORDS) {
    if (v.includes(neg)) return false;
  }
  for (const pos of POSITIVE_KEYWORDS) {
    if (v.includes(pos)) return true;
  }
  return null;
}

// ============================================================
// Date 슬롯 정규화 - 한국어 → ISO
// ============================================================

function normalizeDate(value: string | null): string | null {
  if (!value) return null;

  // 이미 ISO 형식이면 그대로
  const isoMatch = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  // 2023년 4월 1일 / 2023년 4월 / 2023-04 등
  const koreanMatch = value.match(/(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (koreanMatch) {
    const y = koreanMatch[1];
    const m = koreanMatch[2].padStart(2, "0");
    const d = koreanMatch[3].padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // 4월 1일만 있는 경우 등 — 부분 매칭은 skip
  return null;
}

// ============================================================
// Amount 슬롯 정규화 - 한국어 숫자 → 정수
// ============================================================

/**
 * "1억 2천만원" → 120000000
 * "8천만원" → 80000000
 * "전액" → null (unreturned_amount 일 때 deposit_amount 와 동일 의미)
 */
function normalizeAmount(value: string | null): number | null {
  if (!value) return null;

  // 순수 숫자
  const pureNum = value.replace(/[,\s원\s]/g, "").match(/^\d+$/);
  if (pureNum) return parseInt(pureNum[0], 10);

  // 한국어 단위 파싱
  let amount = 0;
  let found = false;

  // 억
  const eokMatch = value.match(/(\d+)\s*억/);
  if (eokMatch) {
    amount += parseInt(eokMatch[1], 10) * 100000000;
    found = true;
  }

  // 천만 (예: "2천만")
  const cheonManMatch = value.match(/(\d+)\s*천\s*만/);
  if (cheonManMatch) {
    amount += parseInt(cheonManMatch[1], 10) * 10000000;
    found = true;
  } else {
    // 그냥 만 (예: "5천5백만" 같은 케이스는 단순화 위해 스킵)
    const manMatch = value.match(/(\d+)\s*만/);
    if (manMatch) {
      amount += parseInt(manMatch[1], 10) * 10000;
      found = true;
    }
  }

  return found ? amount : null;
}

// ============================================================
// Array 슬롯 정규화 - 키워드 → enum
// ============================================================

const NOTICE_METHOD_MAP: Record<string, string> = {
  "카톡": "kakao",
  "카카오": "kakao",
  "카카오톡": "kakao",
  "문자": "sms",
  "sms": "sms",
  "전화": "phone",
  "통화": "phone",
  "내용증명": "certified_mail",
  "이메일": "email",
  "메일": "email",
};

function normalizeArrayWithMap(
  value: string | null,
  map: Record<string, string>,
): string[] | null {
  if (!value) return null;
  const v = String(value).toLowerCase();
  const matched = new Set<string>();
  for (const [keyword, enumValue] of Object.entries(map)) {
    if (v.includes(keyword)) {
      matched.add(enumValue);
    }
  }
  return matched.size > 0 ? Array.from(matched).sort() : null;
}

// ============================================================
// 슬롯별 비교 로직
// ============================================================

interface SlotDef {
  type: "boolean" | "date" | "amount" | "array_notice_method" | "string";
}

const SLOT_TYPES: Record<string, SlotDef> = {
  has_contract_doc: { type: "boolean" },
  contract_start_date: { type: "date" },
  contract_end_date: { type: "date" },
  deposit_amount: { type: "amount" },
  unreturned_amount: { type: "amount" },
  has_resident_reg: { type: "boolean" },
  has_fixed_date: { type: "boolean" },
  has_moved_out: { type: "boolean" },
  notice_date: { type: "date" },
  notice_method: { type: "array_notice_method" },
  landlord_responded: { type: "boolean" },
  has_kakao_records: { type: "boolean" },
  has_certified_mail: { type: "boolean" },
  has_transfer_records: { type: "boolean" },
  has_lien_registration: { type: "boolean" },
  registry_check: { type: "boolean" },
};

function compareSlot(
  slotKey: string,
  gtValue: unknown,
  predictedValue: string | null,
  predictedStatus: CollectedStatus,
): { match: SlotMatch; normalized: unknown; reason?: string } {
  // status 가 unknown 이거나 value 가 없으면 missing
  if (predictedStatus === "unknown" || !predictedValue) {
    return { match: "missing", normalized: null };
  }

  const def = SLOT_TYPES[slotKey];
  if (!def) {
    // 정의되지 않은 슬롯은 단순 문자열 비교
    const matches = String(gtValue) === String(predictedValue);
    return {
      match: matches ? "match" : "mismatch",
      normalized: predictedValue,
    };
  }

  switch (def.type) {
    case "boolean": {
      const normalized = normalizeBoolean(predictedValue);
      if (normalized === null) {
        return {
          match: "unparseable",
          normalized: null,
          reason: `boolean 정규화 실패: "${predictedValue}"`,
        };
      }
      if (normalized === gtValue) {
        return { match: "match", normalized };
      }
      return {
        match: "mismatch",
        normalized,
        reason: `gt=${gtValue}, predicted="${predictedValue}" → ${normalized}`,
      };
    }

    case "date": {
      const normalized = normalizeDate(predictedValue);
      if (!normalized) {
        return {
          match: "unparseable",
          normalized: null,
          reason: `date 정규화 실패: "${predictedValue}"`,
        };
      }
      if (normalized === gtValue) {
        return { match: "match", normalized };
      }
      return {
        match: "mismatch",
        normalized,
        reason: `gt="${gtValue}", predicted="${predictedValue}" → "${normalized}"`,
      };
    }

    case "amount": {
      // "전액" 같은 표현 처리 - unreturned_amount 가 "전액" 이면 deposit_amount 와 동일 의미
      // 단순화: 정규화 실패 시 일단 unparseable, 데모용 OK
      const normalized = normalizeAmount(predictedValue);
      if (normalized === null) {
        // "전액", "전부" 같은 정성 표현
        if (predictedValue.includes("전액") || predictedValue.includes("전부")) {
          // gtValue 가 0 보다 크면 매칭 가능 (실제 deposit 액수와 동일하다는 의미)
          if (typeof gtValue === "number" && gtValue > 0) {
            return {
              match: "match",
              normalized: gtValue,
              reason: `정성 표현 "전액" → gt 와 동일로 처리`,
            };
          }
        }
        return {
          match: "unparseable",
          normalized: null,
          reason: `amount 정규화 실패: "${predictedValue}"`,
        };
      }
      if (normalized === gtValue) {
        return { match: "match", normalized };
      }
      return {
        match: "mismatch",
        normalized,
        reason: `gt=${gtValue}, predicted=${normalized}`,
      };
    }

    case "array_notice_method": {
      const normalized = normalizeArrayWithMap(predictedValue, NOTICE_METHOD_MAP);
      if (!normalized) {
        return {
          match: "unparseable",
          normalized: null,
          reason: `notice_method 정규화 실패: "${predictedValue}"`,
        };
      }
      // GT 도 정렬
      const gtArr = Array.isArray(gtValue)
        ? [...gtValue].sort()
        : [String(gtValue)];
      // set 동일 비교
      const setsEqual =
        normalized.length === gtArr.length &&
        normalized.every((v, i) => v === gtArr[i]);
      return {
        match: setsEqual ? "match" : "mismatch",
        normalized,
        reason: setsEqual
          ? undefined
          : `gt=[${gtArr.join(",")}], predicted=[${normalized.join(",")}]`,
      };
    }

    default:
      return {
        match: "match",
        normalized: predictedValue,
      };
  }
}

// ============================================================
// LLM-as-Judge: baseline 대화에서 슬롯 추출
// ============================================================

const JUDGE_SYSTEM_PROMPT = `당신은 임대차 분쟁 상담 대화를 분석하는 어시스턴트입니다.
주어진 대화에서 의뢰인이 다음 16개 슬롯에 대해 답변한 정보를 추출하세요.

슬롯 목록:
- has_contract_doc (계약서 보유)
- contract_start_date (계약 시작일, YYYY-MM-DD)
- contract_end_date (계약 종료일, YYYY-MM-DD)
- deposit_amount (보증금 액수, 원 단위 숫자)
- unreturned_amount (미반환 금액, 원 단위 숫자)
- has_resident_reg (전입신고 여부)
- has_fixed_date (확정일자 여부)
- has_moved_out (퇴거 여부, true=이미 퇴거 / false=아직 거주)
- notice_date (계약 종료 통보일, YYYY-MM-DD)
- notice_method (통보 방식, 배열, 예: ["kakao", "phone"])
- landlord_responded (집주인 답변 여부)
- has_kakao_records (카카오톡/문자 기록 보유)
- has_certified_mail (내용증명 발송 여부)
- has_transfer_records (계좌이체 내역 보유)
- has_lien_registration (임차권등기명령 신청 여부)
- registry_check (등기부등본 확인 여부)

대화에서 의뢰인이 명시적으로 답한 정보만 추출하세요.
정보가 없으면 status: "unknown" 으로 표시하세요.

다음 JSON 형식으로만 응답하세요:
{
  "has_contract_doc": { "status": "confirmed" | "unknown", "value": "원본 문장 그대로 또는 null" },
  ...
}`;

async function extractCollectedFromConversation(
  conversation: ExperimentResult["conversation"],
  openai?: OpenAI,
  model?: string,
): Promise<CollectedItem[]> {
  const client = openai ?? new OpenAI();
  const judgeModel = model ?? process.env.OPENAI_JUDGE_MODEL ?? "gpt-5-mini";

  // 대화 텍스트화
  const conversationText = conversation
    .map((t) => `[${t.speaker === "client" ? "의뢰인" : "AI"}]: ${t.content}`)
    .join("\n\n");

  const completion = await client.chat.completions.create({
    model: judgeModel,
    messages: [
      { role: "system", content: JUDGE_SYSTEM_PROMPT },
      { role: "user", content: `다음 대화를 분석해주세요:\n\n${conversationText}` },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: Record<string, { status: string; value: string | null }>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  // CollectedItem 형식으로 변환
  return Object.entries(parsed).map(([key, v]) => ({
    key,
    status: (v.status === "confirmed" ? "confirmed" : "unknown") as CollectedStatus,
    value: v.value ?? null,
  }));
}

// ============================================================
// 메인 평가 함수
// ============================================================

export async function evaluateQuantitativeResult(
  result: ExperimentResult,
  options?: { openai?: OpenAI; judgeModel?: string },
): Promise<QuanEvaluationReport> {
  // baseline 의 경우 collected 가 빈 배열이면 LLM-as-Judge 로 추출
  let collected = result.final_collected;
  if (
    collected.length === 0 &&
    (result.system === "gpt_baseline" || result.system === "claude_baseline")
  ) {
    collected = await extractCollectedFromConversation(
      result.conversation,
      options?.openai,
      options?.judgeModel,
    );
  }

  // collected 를 key 기준 map 으로 변환
  const collectedMap = new Map<string, CollectedItem>();
  for (const item of collected) {
    collectedMap.set(item.key, item);
  }

  // GT 의 각 슬롯에 대해 비교
  const slotResults: SlotResult[] = [];
  let matches = 0,
    mismatches = 0,
    missing = 0,
    unparseable = 0;

  for (const [slotKey, gtEntry] of Object.entries(result.ground_truth)) {
    const gtValue = (gtEntry as { value: unknown }).value;
    const predicted = collectedMap.get(slotKey);
    const predictedValue = predicted?.value ?? null;
    const predictedStatus = predicted?.status ?? "unknown";

    const cmp = compareSlot(slotKey, gtValue, predictedValue, predictedStatus);
    slotResults.push({
      slot: slotKey,
      gt_value: gtValue,
      predicted_status: predictedStatus,
      predicted_value: predictedValue,
      normalized_predicted: cmp.normalized,
      match: cmp.match,
      reason: cmp.reason,
    });

    switch (cmp.match) {
      case "match":
        matches++;
        break;
      case "mismatch":
        mismatches++;
        break;
      case "missing":
        missing++;
        break;
      case "unparseable":
        unparseable++;
        break;
    }
  }

  const totalSlots = slotResults.length;
  const recall = totalSlots > 0 ? matches / totalSlots : 0;

  return {
    case_id: result.case_id,
    case_title: result.case_title,
    system: result.system,
    total_slots: totalSlots,
    matches,
    mismatches,
    missing,
    unparseable,
    recall,
    slot_results: slotResults,
    conversation_turns: result.total_turns,
    end_reason: result.end_reason,
    evaluated_at: new Date().toISOString(),
  };
}

// ============================================================
// LangSmith Evaluator Adapter
// ============================================================

export async function quanEvaluator({
  outputs,
}: {
  outputs: Record<string, unknown>;
  referenceOutputs?: Record<string, unknown>;
}) {
  const result = outputs as unknown as ExperimentResult;
  const report = await evaluateQuantitativeResult(result);

  return {
    key: "recall",
    score: report.recall,
  };
}

// ============================================================
// 결과 저장
// ============================================================

export function saveQuanEvalReport(
  report: QuanEvaluationReport,
  resultsDir: string = "eval/runner/results",
): string {
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  const timestamp = report.evaluated_at.replace(/[:.]/g, "-");
  const filename = `${report.case_id}-${report.system}-${timestamp}-eval.json`;
  const filepath = path.join(resultsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2), "utf-8");
  return filepath;
}

// ============================================================
// 콘솔 출력 헬퍼
// ============================================================

export function printQuanEvalSummary(report: QuanEvaluationReport): void {
  console.log("\n=== Quantitative Evaluation Report ===");
  console.log(`Case:        ${report.case_id} - ${report.case_title}`);
  console.log(`System:      ${report.system}`);
  console.log(`Turns:       ${report.conversation_turns}`);
  console.log(`End reason:  ${report.end_reason}`);
  console.log(`\nSlot Results (${report.total_slots} slots):`);
  console.log(`  Matches:     ${report.matches}`);
  console.log(`  Mismatches:  ${report.mismatches}`);
  console.log(`  Missing:     ${report.missing}`);
  console.log(`  Unparseable: ${report.unparseable}`);
  console.log(`\nRecall:      ${(report.recall * 100).toFixed(1)}%`);

  // mismatch / unparseable 만 디테일 출력
  const issues = report.slot_results.filter(
    (s) => s.match === "mismatch" || s.match === "unparseable",
  );
  if (issues.length > 0) {
    console.log(`\nIssues:`);
    for (const issue of issues) {
      console.log(
        `  [${issue.match}] ${issue.slot}: ${issue.reason ?? ""}`,
      );
    }
  }
  console.log("=========================\n");
}

// ============================================================
// CLI Entry Point
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: npx tsx eval/runner/evaluators/quan_evaluator.ts <result_json_path>");
    console.error("  example: npx tsx eval/runner/evaluators/quan_evaluator.ts eval/runner/results/IA-CASE-002-ia-2026...json");
    process.exit(1);
  }

  const resultPath = args[0];
  if (!fs.existsSync(resultPath)) {
    console.error(`Result file not found: ${resultPath}`);
    process.exit(1);
  }

  const result = JSON.parse(fs.readFileSync(resultPath, "utf-8")) as ExperimentResult;
  const report = await evaluateQuantitativeResult(result);
  const saved = saveQuanEvalReport(report);

  printQuanEvalSummary(report);
  console.log(`Eval report saved to: ${saved}\n`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Eval error:", err);
    process.exit(1);
  });
}
