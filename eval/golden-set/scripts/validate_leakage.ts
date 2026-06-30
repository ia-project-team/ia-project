/**
 * G5 누출 검사 (Leakage Validation)
 *
 * 목적:
 *   케이스 frontmatter의 `simulator.proactive_speech_pool` 발화가
 *   GT 16슬롯의 `value`를 노출하지 않는지 정적 검사한다.
 *   (시뮬레이션 실행 전 케이스 파일 자체에 대한 검사)
 *
 * 검사 범위 (설계 1안):
 *   - GT 16슬롯의 `value`만 검사. `detail`은 검사 제외 (자연어 false positive 폭증 방지)
 *   - boolean 슬롯은 스킵 (true/false는 한국어 대화에서 직접 등장 안 함)
 *   - substring 매칭 + 한국어 변형 일부 (날짜·금액·enum 한글 표시명)
 *
 * 종료 코드:
 *   0 — 위반 0건 (모든 케이스 통과)
 *   1 — 위반 1건 이상 (CI 게이트 실패)
 *   2 — 사용법 오류 또는 케이스 파일 찾을 수 없음
 *
 * 사용법:
 *   npx tsx eval/golden-set/scripts/validate_leakage.ts <case_id>           # 단일 케이스
 *   npx tsx eval/golden-set/scripts/validate_leakage.ts <case_id> <case_id> # 복수 케이스
 *   npx tsx eval/golden-set/scripts/validate_leakage.ts --all               # 전체
 *   npx tsx eval/golden-set/scripts/validate_leakage.ts --all --json        # 전체, JSON 출력
 *
 * 미결 (1차 결과 본 뒤 결정 — 문서 3 §5):
 *   - detail 필드 검사 포함 여부 (현재 제외)
 *   - 매칭 방식 고도화 (substring → 토큰 / 임베딩)
 */

import fs from "fs";
import path from "path";
import {
  loadCase,
  loadCasesFromDir,
  type GoldenSetCase,
  type GTValue,
} from "../../runner/simulator";

// ============================================================
// 한국어 변형 생성기 (GT value → 검사 후보 substring)
// ============================================================

/**
 * GT slot value를 한국어 대화 텍스트에서 검사할 substring 후보들로 변형.
 *
 * 정책:
 *   - 너무 짧은 후보(< 2글자)는 호출부에서 제외 → false positive 방지
 *   - boolean은 빈 배열 (검사 대상 아님)
 *   - 숫자 = 금액 슬롯으로 가정 → 한국식 표현(억/천만/만) 생성
 *   - 문자열 = 날짜(YYYY-MM-DD) 또는 enum 또는 자유 텍스트
 *   - 배열 = 각 요소 재귀
 */
export function generateSearchTerms(_slotKey: string, gt: GTValue): string[] {
  const value = gt.value;
  const terms: Set<string> = new Set();

  // boolean: 검사 의미 없음
  if (typeof value === "boolean") return [];

  // 숫자 (금액 슬롯)
  if (typeof value === "number") {
    terms.add(String(value)); // 원본 숫자 그대로

    const EOK = 100_000_000;
    const CHEON_MAN = 10_000_000;
    const MAN = 10_000;

    const eok = Math.floor(value / EOK);
    const remainAfterEok = value % EOK;
    const cheonMan = Math.floor(remainAfterEok / CHEON_MAN);

    if (eok > 0) {
      // "1억", "1억원"
      terms.add(`${eok}억`);
      terms.add(`${eok}억원`);
      if (cheonMan > 0) {
        // "1억 2천", "1억2천", "1억 2천만원", "1억2천만원"
        terms.add(`${eok}억 ${cheonMan}천`);
        terms.add(`${eok}억${cheonMan}천`);
        terms.add(`${eok}억 ${cheonMan}천만원`);
        terms.add(`${eok}억${cheonMan}천만원`);
      }
    } else {
      // 1억 미만 — 만원 단위 표현
      const man = Math.floor(value / MAN);
      if (man > 0) {
        terms.add(`${man}만원`);
        // 천만원 단위가 깔끔하면 (7000만원 같은 경우)
        const cheonMan2 = Math.floor(value / CHEON_MAN);
        if (cheonMan2 > 0 && value % CHEON_MAN === 0) {
          terms.add(`${cheonMan2}천만원`);
          terms.add(`${cheonMan2}천`);
        }
      }
    }
    return [...terms];
  }

  // 문자열
  if (typeof value === "string") {
    // 날짜 YYYY-MM-DD
    const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateMatch) {
      const [, y, m, d] = dateMatch;
      const month = parseInt(m, 10);
      const day = parseInt(d, 10);
      terms.add(value); // 원본
      terms.add(`${y}-${m}-${d}`); // 원본 (중복이지만 안전)
      terms.add(`${y}년`);
      terms.add(`${y}년 ${month}월`);
      terms.add(`${y}년 ${month}월 ${day}일`);
      terms.add(`${month}월 ${day}일`);
      terms.add(`${month}월`);
      // 두자리 연도 (예: "23년")
      terms.add(`${y.slice(2)}년`);
      return [...terms];
    }

    // enum (notice_method 등)
    const enumKoreanMap: Record<string, string[]> = {
      kakao: ["카톡", "카카오톡", "카카오"],
      sms: ["문자", "문자메시지"],
      phone: ["전화", "통화"],
      certified_mail: ["내용증명"],
      email: ["이메일", "메일"],
      none: [],
      unknown: [],
    };
    if (value in enumKoreanMap) {
      enumKoreanMap[value].forEach((k) => terms.add(k));
      return [...terms];
    }

    // 자유 텍스트 — 그대로 검사 (길이 가드는 호출부)
    terms.add(value);
    return [...terms];
  }

  // 배열 (notice_method: [kakao, phone] 등)
  if (Array.isArray(value)) {
    for (const v of value) {
      // 재귀: 배열의 각 요소를 같은 슬롯으로 처리
      const sub = generateSearchTerms(_slotKey, { value: v } as GTValue);
      sub.forEach((t) => terms.add(t));
    }
    return [...terms];
  }

  return [];
}

// ============================================================
// 누출 검사
// ============================================================

export interface LeakageViolation {
  case_id: string;
  pool_index: number;
  pool_utterance: string;
  slot_key: string;
  leaked_term: string;
  gt_value: unknown;
}

export function checkLeakage(c: GoldenSetCase): LeakageViolation[] {
  const violations: LeakageViolation[] = [];
  const pool = c.simulator.proactive_speech_pool ?? [];

  for (let i = 0; i < pool.length; i++) {
    const utterance = pool[i];
    for (const [slotKey, gtValue] of Object.entries(c.ground_truth)) {
      const terms = generateSearchTerms(slotKey, gtValue);
      for (const term of terms) {
        if (term.length < 2) continue; // false positive 가드
        if (utterance.includes(term)) {
          violations.push({
            case_id: c.case_id,
            pool_index: i,
            pool_utterance: utterance,
            slot_key: slotKey,
            leaked_term: term,
            gt_value: gtValue.value,
          });
        }
      }
    }
  }

  return violations;
}

// ============================================================
// 리포트
// ============================================================

const COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
  reset: "\x1b[0m",
};

interface CaseResult {
  case_id: string;
  pool_size: number;
  violations: LeakageViolation[];
}

function printConsoleReport(results: CaseResult[]) {
  const { red, green, yellow, cyan, gray, bold, reset } = COLORS;
  let totalViolations = 0;

  console.log(`\n${bold}=== G5 Leakage Validation ===${reset}`);
  console.log(
    `${gray}검사: proactive_speech_pool 발화 ↔ GT 16슬롯 value (substring + 한국어 변형)${reset}`
  );
  console.log(`${gray}범위: value만, detail 제외, boolean 스킵${reset}\n`);

  for (const r of results) {
    const status =
      r.violations.length === 0
        ? `${green}✓ PASS${reset}`
        : `${red}✗ FAIL (${r.violations.length} violation${r.violations.length > 1 ? "s" : ""})${reset}`;
    console.log(
      `${bold}[${r.case_id}]${reset} ${status} ${gray}(pool size: ${r.pool_size})${reset}`
    );

    if (r.violations.length === 0) continue;

    for (const v of r.violations) {
      console.log(
        `  ${yellow}pool[${v.pool_index}]${reset} "${cyan}${v.pool_utterance}${reset}"`
      );
      console.log(
        `    → slot ${bold}${v.slot_key}${reset} ${gray}(GT: ${JSON.stringify(v.gt_value)})${reset}`
      );
      console.log(`    → leaked term: ${red}"${v.leaked_term}"${reset}`);
    }
    console.log();
    totalViolations += r.violations.length;
  }

  console.log(
    `${bold}Summary:${reset} ${results.length} case(s) checked, ${
      totalViolations === 0
        ? `${green}0${reset}`
        : `${red}${totalViolations}${reset}`
    } violation(s)\n`
  );
}

// ============================================================
// CLI
// ============================================================

function printUsage() {
  console.error("Usage:");
  console.error(
    "  npx tsx eval/golden-set/scripts/validate_leakage.ts <case_id> [<case_id> ...]"
  );
  console.error("  npx tsx eval/golden-set/scripts/validate_leakage.ts --all");
  console.error(
    "  npx tsx eval/golden-set/scripts/validate_leakage.ts --all --json"
  );
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printUsage();
    process.exit(2);
  }

  const jsonOutput = args.includes("--json");
  const all = args.includes("--all");
  const casesDir = path.resolve(process.cwd(), "eval/golden-set/cases");

  let cases: GoldenSetCase[] = [];

  if (all) {
    cases = loadCasesFromDir(casesDir);
  } else {
    const caseIds = args.filter((a) => !a.startsWith("--"));
    if (caseIds.length === 0) {
      printUsage();
      process.exit(2);
    }
    for (const caseId of caseIds) {
      const casePath = path.join(casesDir, `${caseId}.md`);
      if (!fs.existsSync(casePath)) {
        console.error(`Case file not found: ${casePath}`);
        process.exit(2);
      }
      const c = loadCase(casePath);
      if (c) cases.push(c);
      else
        console.error(
          `Warning: ${caseId} could not be parsed (empty or invalid frontmatter)`
        );
    }
  }

  if (cases.length === 0) {
    console.error("No valid cases found.");
    process.exit(2);
  }

  const results: CaseResult[] = cases.map((c) => ({
    case_id: c.case_id,
    pool_size: c.simulator.proactive_speech_pool?.length ?? 0,
    violations: checkLeakage(c),
  }));

  const totalViolations = results.reduce(
    (sum, r) => sum + r.violations.length,
    0
  );

  if (jsonOutput) {
    console.log(
      JSON.stringify({ results, total_violations: totalViolations }, null, 2)
    );
  } else {
    printConsoleReport(results);
  }

  process.exit(totalViolations === 0 ? 0 : 1);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(2);
  });
}
