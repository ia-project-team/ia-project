import fs from "node:fs";
import path from "node:path";

import { CHECKLIST } from "../src/core/checklist";
import type { Session } from "../src/server/session/sessionStore";

type UsageTotals = {
  apiCallsAttempted: number;
  embeddingInputTokens: number;
  lunaInputTokens: number;
  lunaCachedInputTokens: number;
  lunaOutputTokens: number;
  lunaReasoningTokens: number;
};

type PlannedAction =
  | { kind: "initial"; message: string }
  | { kind: "rag"; targetFact: string; message: string }
  | { kind: "checklist"; key: string; message: string };

type TranscriptTurn = {
  turn: number;
  user: string;
  userIntent: string;
  assistant: string;
  phase: string;
  durationMs: number;
  newlyCompletedChecklistKeys: string[];
  completedChecklistCount: number;
  pendingRagBefore: string | null;
  pendingRagAfter: string | null;
  ragFactsAfter: string[];
  nextChecklistKey: string | null;
  assistantQuestionCount: number;
};

const ROOT = process.cwd();
const RESULTS_DIR = path.join(ROOT, "data/rag/eval/results");
const EXPECTED_TRIGGER_ID = "hug-casebook-trigger-12-trustee-consent";
const EXPECTED_TRIGGER_TARGET = "수탁자의 임대차 동의 또는 임대 권한 확인 여부";
const EXPECTED_TRIGGER_QUESTION =
  "계약 당시 등기상 수탁자가 임대차에 동의했다는 자료가 있나요?";
const INITIAL_USER_MESSAGE =
  "등기명의가 신탁회사이고 계약할 때 수탁자 동의 여부를 확인하지 못했습니다. " +
  "보증금을 돌려받지 못해 상담을 준비하고 싶어요.";

const CHECKLIST_ANSWERS: Record<string, string> = {
  has_contract_doc: "네, 임대차계약서를 가지고 있습니다.",
  contract_start_date: "계약 시작일은 2024년 3월 2일입니다.",
  contract_end_date: "계약 종료일은 2026년 3월 1일입니다.",
  deposit_amount: "임대차 보증금은 2억 원입니다.",
  unreturned_amount: "아직 돌려받지 못한 금액은 2억 원 전액입니다.",
  has_resident_reg: "네, 입주한 날 전입신고를 했습니다.",
  has_fixed_date: "네, 임대차계약서에 확정일자를 받았습니다.",
  has_moved_out: "아니요, 아직 그 집에 거주 중이고 퇴거하지 않았습니다.",
  notice_date: "2026년 1월 10일에 계약 종료 의사를 통보했습니다.",
  notice_method: "카카오톡과 문자로 계약 종료 의사를 통보했습니다.",
  landlord_responded: "임대인이 답변했는지는 잘 모르겠습니다.",
  has_kakao_records: "네, 임대인과 주고받은 카카오톡과 문자 내역을 보관하고 있습니다.",
  has_certified_mail: "내용증명은 보내지 않아서 해당 없습니다.",
  has_transfer_records: "네, 보증금을 송금한 계좌이체 내역이 있습니다.",
  has_lien_registration: "아니요, 임차권등기명령은 아직 신청하지 않았습니다.",
  registry_check:
    "등기부는 확인했고 신탁회사 명의인 점 외의 선순위 권리는 잘 모르겠습니다.",
};

const QUESTION_HINTS: Record<string, RegExp[]> = {
  has_contract_doc: [
    /(?:임대차\s*)?계약서.{0,20}(?:가지|보유|있으|있나|있나요)/u,
  ],
  contract_start_date: [
    /(?:계약|임대차).{0,18}(?:시작|개시|체결).{0,18}(?:언제|날짜|일자)/u,
    /언제부터.{0,12}(?:계약|임대|거주)/u,
  ],
  contract_end_date: [
    /(?:계약|임대차).{0,18}(?:종료|만료).{0,18}(?:언제|날짜|일자)/u,
    /(?:계약|임대차).{0,18}언제까지/u,
  ],
  deposit_amount: [
    /보증금.{0,18}(?:얼마|액수|금액|규모)/u,
  ],
  unreturned_amount: [
    /(?:돌려받지|못\s*받|미반환).{0,24}(?:얼마|금액|보증금|전액)/u,
    /(?:얼마|금액|보증금).{0,24}(?:돌려받지|못\s*받|미반환)/u,
  ],
  has_resident_reg: [/전입\s*신고/u],
  has_fixed_date: [/확정\s*일자/u],
  has_moved_out: [
    /(?:퇴거|이사).{0,18}(?:상태|했|하셨|나왔|나오셨|전인가요)/u,
    /현재.{0,18}(?:거주|살고|머물고)/u,
  ],
  notice_date: [
    /(?:종료|해지).{0,40}(?:통보|알리).{0,24}(?:언제|시점|날짜|일자)/u,
    /(?:언제|시점|날짜|일자).{0,18}(?:통보|알리)/u,
    /(?:처음\s*)?(?:통보|알린).{0,12}(?:시점|날짜|일자|때).{0,12}언제/u,
  ],
  notice_method: [
    /(?:통보|알리).{0,18}(?:방법|방식|어떻게|수단)/u,
    /(?:방법|방식|어떻게|수단).{0,18}(?:통보|알리)/u,
  ],
  landlord_responded: [
    /(?:임대인|집주인).{0,22}(?:답변|응답|회신|반응|연락)/u,
  ],
  has_kakao_records: [
    /(?:카카오톡|카톡|문자|메시지).{0,22}(?:내역|기록|보관|남아|있으|있나)/u,
  ],
  has_certified_mail: [/내용\s*증명/u],
  has_transfer_records: [
    /(?:계좌\s*이체|송금).{0,22}(?:내역|기록|자료|보관|있으|있나)/u,
  ],
  has_lien_registration: [/임차권\s*등기/u],
  registry_check: [
    /(?:등기부|등기부등본).{0,24}(?:선순위|권리|확인)/u,
    /선순위\s*권리/u,
  ],
};

const QUESTION_MATCH_ORDER = [
  "unreturned_amount",
  "contract_start_date",
  "contract_end_date",
  "notice_date",
  "notice_method",
  "landlord_responded",
  "has_kakao_records",
  "has_transfer_records",
  "has_lien_registration",
  "has_resident_reg",
  "has_fixed_date",
  "has_moved_out",
  "has_certified_mail",
  "registry_check",
  "has_contract_doc",
  "deposit_amount",
];

function parsePositiveIntegerArg(name: string, fallback: number): number {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name}은 양의 정수여야 합니다.`);
  }
  return parsed;
}

function parsePositiveNumberArg(name: string, fallback: number): number {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name}은 0보다 큰 숫자여야 합니다.`);
  }
  return parsed;
}

function usageNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function estimatedCostUsd(usage: UsageTotals): number {
  return (
    usage.embeddingInputTokens * 0.02 / 1_000_000 +
    usage.lunaInputTokens * 0.20 / 1_000_000 +
    usage.lunaCachedInputTokens * 0.02 / 1_000_000 +
    usage.lunaOutputTokens * 1.20 / 1_000_000
  );
}

function rounded(value: number, digits = 6): number {
  return Number(value.toFixed(digits));
}

function requestUrl(input: RequestInfo | URL): URL | null {
  try {
    if (typeof input === "string") return new URL(input);
    if (input instanceof URL) return input;
    return new URL(input.url);
  } catch {
    return null;
  }
}

function isTrackedOpenAIPath(url: URL | null): boolean {
  if (!url) return false;
  return ["/embeddings", "/responses", "/chat/completions"].some((suffix) =>
    url.pathname.endsWith(suffix),
  );
}

function collectUsage(body: unknown, url: URL, usage: UsageTotals): void {
  if (!body || typeof body !== "object") return;
  const response = body as Record<string, unknown>;
  if (!response.usage || typeof response.usage !== "object") return;
  const rawUsage = response.usage as Record<string, unknown>;

  if (url.pathname.endsWith("/embeddings")) {
    usage.embeddingInputTokens += usageNumber(
      rawUsage.prompt_tokens ?? rawUsage.total_tokens,
    );
    return;
  }

  const inputTokens = usageNumber(rawUsage.input_tokens ?? rawUsage.prompt_tokens);
  const outputTokens = usageNumber(
    rawUsage.output_tokens ?? rawUsage.completion_tokens,
  );
  const inputDetails = rawUsage.input_tokens_details;
  const outputDetails = rawUsage.output_tokens_details;
  const cachedTokens = inputDetails && typeof inputDetails === "object"
    ? usageNumber((inputDetails as Record<string, unknown>).cached_tokens)
    : 0;
  const reasoningTokens = outputDetails && typeof outputDetails === "object"
    ? usageNumber((outputDetails as Record<string, unknown>).reasoning_tokens)
    : 0;

  usage.lunaCachedInputTokens += cachedTokens;
  usage.lunaInputTokens += Math.max(0, inputTokens - cachedTokens);
  usage.lunaOutputTokens += outputTokens;
  usage.lunaReasoningTokens += reasoningTokens;
}

function installUsageTracker(
  usage: UsageTotals,
  maxApiCalls: number,
  maxCostUsd: number,
): void {
  const nativeFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = requestUrl(input);
    const tracked = isTrackedOpenAIPath(url);
    if (tracked) {
      if (usage.apiCallsAttempted >= maxApiCalls) {
        throw new Error(`API 호출 안전 한도 ${maxApiCalls}회에 도달했습니다.`);
      }
      if (estimatedCostUsd(usage) >= maxCostUsd) {
        throw new Error(`예상 비용 안전 한도 $${maxCostUsd.toFixed(2)}에 도달했습니다.`);
      }
      usage.apiCallsAttempted += 1;
    }

    const response = await nativeFetch(input, init);
    if (tracked && url) {
      try {
        collectUsage(await response.clone().json(), url, usage);
      } catch {
        // SDK가 원래 응답을 처리하도록 사용량 파싱 실패는 평가를 중단하지 않는다.
      }
    }
    return response;
  }) as typeof fetch;
}

function safeMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/sk-[A-Za-z0-9_*.-]+/gu, "[redacted-api-key]")
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/giu, "Bearer [redacted]");
}

function normalize(value: string): string {
  return value.normalize("NFC").replace(/\s+/gu, "").replace(/[?？.,!！]/gu, "");
}

function questionCount(value: string): number {
  return value.match(/[?？]/gu)?.length ?? 0;
}

function completedChecklistKeys(session: Session): string[] {
  const byKey = new Map(session.collected.map((item) => [item.key, item]));
  return CHECKLIST
    .filter((definition) => {
      const item = byKey.get(definition.key);
      return item?.status === "confirmed" || item?.status === "not_applicable";
    })
    .map((item) => item.key);
}

function missingChecklistKeys(session: Session): string[] {
  const completed = new Set(completedChecklistKeys(session));
  return CHECKLIST.map((item) => item.key).filter((key) => !completed.has(key));
}

function inferChecklistKey(reply: string, missingKeys: string[]): string | null {
  const missing = new Set(missingKeys);
  const normalizedReply = normalize(reply);

  for (const item of CHECKLIST) {
    if (
      missing.has(item.key) &&
      normalizedReply.includes(normalize(item.fallbackQuestion))
    ) {
      return item.key;
    }
  }

  for (const key of QUESTION_MATCH_ORDER) {
    if (!missing.has(key)) continue;
    if (QUESTION_HINTS[key]?.some((pattern) => pattern.test(reply))) return key;
  }
  return null;
}

function inferNextChecklistKey(reply: string, missingKeys: string[]): string | null {
  return inferChecklistKey(reply, missingKeys) ??
    inferChecklistKey(reply, CHECKLIST.map((item) => item.key));
}

function answerForRagQuestion(targetFact: string): string {
  if (targetFact === EXPECTED_TRIGGER_TARGET) {
    return "아니요, 수탁자가 임대차에 동의했다는 자료는 없습니다.";
  }
  return "그 부분은 잘 모르겠습니다.";
}

function legalAdviceLike(reply: string): boolean {
  return (
    /(?:법적으로|따라서).{0,40}(?:가능합니다|불가능합니다|해야\s*합니다|하셔야\s*합니다)/u.test(
      reply,
    ) ||
    /(?:소송|신청|신고|대응|경매|배당요구).{0,35}(?:하세요|하셔야\s*합니다|해야\s*합니다|권합니다)/u.test(
      reply,
    )
  );
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const maxTurns = parsePositiveIntegerArg("max-turns", 26);
  const maxApiCalls = parsePositiveIntegerArg("max-api-calls", 78);
  const maxCostUsd = parsePositiveNumberArg("max-cost-usd", 0.15);

  if (dryRun) {
    const noticeDateProbe =
      "계약을 종료하고 보증금을 돌려달라고 임대인에게 처음 통보한 시점은 언제인가요?";
    if (inferChecklistKey(noticeDateProbe, ["notice_date"]) !== "notice_date") {
      throw new Error("평가기 자체 검사에서 계약 종료 통보 시점 질문을 식별하지 못했습니다.");
    }
    const unreturnedAmountProbe =
      "현재까지 돌려받지 못한 보증금은 정확히 얼마인가요?";
    if (
      inferNextChecklistKey(unreturnedAmountProbe, ["has_resident_reg"]) !==
      "unreturned_amount"
    ) {
      throw new Error("평가기 자체 검사에서 이미 기록된 항목의 보완 질문을 식별하지 못했습니다.");
    }
    console.log(JSON.stringify({
      ok: true,
      dryRun: true,
      scope: "16개 필수 체크리스트 + RAG 질문 삽입/답변/복귀 + 완료 단계",
      expectedTurns: "18~22",
      estimatedCostUsd: "$0.02~$0.06",
      estimatedCostKrwAt1400: "약 30~85원",
      safety: { maxTurns, maxApiCalls, maxCostUsd },
      apiCalls: 0,
    }, null, 2));
    return;
  }

  const usage: UsageTotals = {
    apiCallsAttempted: 0,
    embeddingInputTokens: 0,
    lunaInputTokens: 0,
    lunaCachedInputTokens: 0,
    lunaOutputTokens: 0,
    lunaReasoningTokens: 0,
  };
  installUsageTracker(usage, maxApiCalls, maxCostUsd);

  const [{ runSingleTurn }, provider] = await Promise.all([
    import("../src/server/llm/turnRunner"),
    import("../src/server/llm/provider"),
  ]);
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY가 현재 실행 환경에 없습니다.");
  }
  if (provider.MULTITURN_MODEL !== "gpt-5.6-luna") {
    throw new Error(`적용 모델이 gpt-5.6-luna가 아닙니다: ${provider.MULTITURN_MODEL}`);
  }
  if (provider.getOpenAIMaxRetries() !== 0) {
    throw new Error("OPENAI_MAX_RETRIES=0이 적용되지 않았습니다.");
  }
  if (process.env.OPENAI_BASE_URL) {
    throw new Error("품질 평가는 공식 OpenAI API에서만 실행할 수 있습니다.");
  }

  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const startedAt = new Date();
  const timestamp = startedAt.toISOString().replace(/[:.]/gu, "-");
  const outputPath = path.join(RESULTS_DIR, `intake-flow-eval-${timestamp}.json`);
  const session: Session = {
    sessionId: `intake-flow-eval-${timestamp}`,
    history: [],
    collected: [],
    ragFacts: [],
    unansweredRagFacts: [],
    pendingRagQuestion: null,
  };
  const transcript: TranscriptTurn[] = [];
  const askedRagTargets: string[] = [];
  const seenAssistantQuestions = new Set<string>();
  const failedChecks: string[] = [];
  let status: "running" | "completed" | "stopped" = "running";
  let errorMessage: string | undefined;
  let finalPhase = "collecting";
  let action: PlannedAction = { kind: "initial", message: INITIAL_USER_MESSAGE };

  const buildSummary = () => {
    const completedKeys = completedChecklistKeys(session);
    const missingKeys = missingChecklistKeys(session);
    const expectedTriggerAsked = transcript.some(
      (turn) => turn.assistant === EXPECTED_TRIGGER_QUESTION,
    );
    const expectedTriggerAnswered = session.ragFacts.some(
      (fact) => fact.targetFact === EXPECTED_TRIGGER_TARGET,
    );
    const expectedRagAnswerTurn = transcript.findIndex(
      (turn) => turn.userIntent === `rag:${EXPECTED_TRIGGER_TARGET}`,
    );
    const checklistResumedAfterRag = transcript.some(
      (turn, index) => index >= expectedRagAnswerTurn && turn.nextChecklistKey !== null,
    );
    const landlordResponse = session.collected.find(
      (item) => item.key === "landlord_responded",
    );
    const oneQuestionWhileCollecting = transcript.every(
      (turn) => turn.phase !== "collecting" || turn.assistantQuestionCount === 1,
    );
    const noQuestionAfterReady = transcript.every(
      (turn) => turn.phase !== "ready_to_advise" || turn.assistantQuestionCount === 0,
    );
    const noLegalAdvice = transcript.every((turn) => !legalAdviceLike(turn.assistant));

    return {
      passed: failedChecks.length === 0 && status === "completed",
      turns: transcript.length,
      checklist: {
        total: CHECKLIST.length,
        completed: completedKeys.length,
        missingKeys,
        allRequired: CHECKLIST.every((item) => item.required),
        unknownAnswerCounted:
          landlordResponse?.status === "confirmed" && landlordResponse.value !== null,
      },
      rag: {
        expectedTriggerId: EXPECTED_TRIGGER_ID,
        expectedTriggerAsked,
        expectedTriggerAnswered,
        onlyExpectedTriggerAsked:
          askedRagTargets.length === 1 &&
          askedRagTargets[0] === EXPECTED_TRIGGER_TARGET,
        checklistResumedAfterRag,
        askedTargets: askedRagTargets,
        storedFacts: session.ragFacts.map((fact) => fact.targetFact),
        unansweredFacts: session.unansweredRagFacts,
      },
      conversation: {
        finalPhase,
        oneQuestionWhileCollecting,
        noQuestionAfterReady,
        noRepeatedExactQuestion:
          transcript.filter((turn) => turn.assistantQuestionCount > 0).length ===
          seenAssistantQuestions.size,
        noLegalAdvice,
      },
      failedChecks,
    };
  };

  const writeReport = () => {
    const costUsd = estimatedCostUsd(usage);
    const report = {
      schemaVersion: "1.0",
      status,
      error: errorMessage,
      startedAt: startedAt.toISOString(),
      updatedAt: new Date().toISOString(),
      model: provider.MULTITURN_MODEL,
      keySource: process.env.RAG_EVAL_KEY_SOURCE ?? "unspecified",
      retries: provider.getOpenAIMaxRetries(),
      scenario: {
        synthetic: true,
        initialUserMessage: INITIAL_USER_MESSAGE,
        expectedTriggerId: EXPECTED_TRIGGER_ID,
      },
      safety: { maxTurns, maxApiCalls, maxCostUsd },
      usage: {
        ...usage,
        estimatedCostUsd: rounded(costUsd),
        estimatedCostKrwAt1400: rounded(costUsd * 1_400, 2),
      },
      summary: buildSummary(),
      finalCollected: session.collected,
      finalRagFacts: session.ragFacts,
      transcript,
    };
    fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  };

  try {
    for (let turn = 1; turn <= maxTurns; turn += 1) {
      const beforeCompleted = new Set(completedChecklistKeys(session));
      const pendingRagBefore = session.pendingRagQuestion?.targetFact ?? null;
      const startedTurnAt = Date.now();
      const result = await runSingleTurn(
        action.message,
        session,
        provider.MULTITURN_MODEL,
      );
      finalPhase = result.phase;

      const completedAfter = completedChecklistKeys(session);
      const newlyCompleted = completedAfter.filter((key) => !beforeCompleted.has(key));
      const pendingRagAfter = session.pendingRagQuestion?.targetFact ?? null;
      if (pendingRagAfter) {
        if (pendingRagAfter !== EXPECTED_TRIGGER_TARGET) {
          throw new Error(`허용하지 않은 RAG 질문이 나왔습니다: ${pendingRagAfter}`);
        }
        if (askedRagTargets.includes(pendingRagAfter)) {
          throw new Error(`같은 RAG 사실을 반복 질문했습니다: ${pendingRagAfter}`);
        }
        askedRagTargets.push(pendingRagAfter);
      }

      if (action.kind === "checklist" && !completedAfter.includes(action.key)) {
        throw new Error(`명확한 답변을 체크리스트에 수집하지 못했습니다: ${action.key}`);
      }
      if (action.kind === "rag") {
        const answeredTargetFact = action.targetFact;
        if (!session.ragFacts.some((fact) => fact.targetFact === answeredTargetFact)) {
          throw new Error(`RAG 질문의 답변을 저장하지 못했습니다: ${answeredTargetFact}`);
        }
      }
      if (turn === 1 && result.reply !== EXPECTED_TRIGGER_QUESTION) {
        throw new Error("첫 턴에서 기대한 신탁부동산 RAG 질문이 선택되지 않았습니다.");
      }

      const assistantQuestionCount = questionCount(result.reply);
      if (assistantQuestionCount > 0) {
        const normalizedQuestion = normalize(result.reply);
        if (seenAssistantQuestions.has(normalizedQuestion)) {
          throw new Error(`동일한 질문을 반복했습니다: ${result.reply}`);
        }
        seenAssistantQuestions.add(normalizedQuestion);
      }
      if (result.phase === "collecting" && assistantQuestionCount !== 1) {
        throw new Error(`수집 중 질문 수가 1개가 아닙니다: ${result.reply}`);
      }
      if (legalAdviceLike(result.reply)) {
        throw new Error(`인테이크 질문 대신 법률 답변으로 보이는 문장이 나왔습니다: ${result.reply}`);
      }

      const missingKeys = missingChecklistKeys(session);
      let nextAction: PlannedAction | null = null;
      let nextChecklistKey: string | null = null;
      if (pendingRagAfter) {
        nextAction = {
          kind: "rag",
          targetFact: pendingRagAfter,
          message: answerForRagQuestion(pendingRagAfter),
        };
      } else if (result.phase === "collecting") {
        // 모델이 이미 confirmed로 기록한 값도 더 정확히 보완할 수 있다.
        // 우선 미수집 항목과 대조하고, 없으면 전체 체크리스트에서 질문 대상을 찾는다.
        nextChecklistKey = inferNextChecklistKey(result.reply, missingKeys);
        if (!nextChecklistKey) {
          throw new Error(`체크리스트 질문을 식별하지 못했습니다: ${result.reply}`);
        }
        const answer = CHECKLIST_ANSWERS[nextChecklistKey];
        if (!answer) throw new Error(`테스트 답변이 없습니다: ${nextChecklistKey}`);
        nextAction = { kind: "checklist", key: nextChecklistKey, message: answer };
      }

      transcript.push({
        turn,
        user: action.message,
        userIntent:
          action.kind === "initial"
            ? "initial"
            : `${action.kind}:${action.kind === "rag" ? action.targetFact : action.key}`,
        assistant: result.reply,
        phase: result.phase,
        durationMs: Date.now() - startedTurnAt,
        newlyCompletedChecklistKeys: newlyCompleted,
        completedChecklistCount: completedAfter.length,
        pendingRagBefore,
        pendingRagAfter,
        ragFactsAfter: session.ragFacts.map((fact) => fact.targetFact),
        nextChecklistKey,
        assistantQuestionCount,
      });

      console.log(JSON.stringify({
        turn,
        phase: result.phase,
        completedChecklist: `${completedAfter.length}/${CHECKLIST.length}`,
        pendingRag: pendingRagAfter,
        apiCalls: usage.apiCallsAttempted,
        estimatedCostUsd: rounded(estimatedCostUsd(usage)),
        durationSeconds: rounded((Date.now() - startedTurnAt) / 1_000, 1),
      }));

      if (nextAction === null) {
        const summary = buildSummary();
        if (!summary.checklist.allRequired) failedChecks.push("checklist_not_all_required");
        if (summary.checklist.missingKeys.length > 0) {
          failedChecks.push("checklist_incomplete");
        }
        if (!summary.checklist.unknownAnswerCounted) {
          failedChecks.push("unknown_answer_not_counted");
        }
        if (!summary.rag.expectedTriggerAsked) failedChecks.push("expected_rag_not_asked");
        if (!summary.rag.expectedTriggerAnswered) {
          failedChecks.push("expected_rag_answer_not_stored");
        }
        if (!summary.rag.onlyExpectedTriggerAsked) {
          failedChecks.push("unexpected_rag_question_asked");
        }
        if (!summary.rag.checklistResumedAfterRag) {
          failedChecks.push("checklist_did_not_resume_after_rag");
        }
        if (summary.rag.unansweredFacts.length > 0) {
          failedChecks.push("rag_unanswered_facts_remain");
        }
        if (summary.conversation.finalPhase !== "ready_to_advise") {
          failedChecks.push("final_phase_not_ready_to_advise");
        }
        if (!summary.conversation.oneQuestionWhileCollecting) {
          failedChecks.push("collecting_reply_question_count_invalid");
        }
        if (!summary.conversation.noQuestionAfterReady) {
          failedChecks.push("ready_reply_still_contains_question");
        }
        if (!summary.conversation.noRepeatedExactQuestion) {
          failedChecks.push("repeated_exact_question");
        }
        if (!summary.conversation.noLegalAdvice) failedChecks.push("legal_advice_detected");

        status = failedChecks.length === 0 ? "completed" : "stopped";
        writeReport();
        console.log(JSON.stringify({
          completed: status === "completed",
          outputPath,
          usage: {
            ...usage,
            estimatedCostUsd: rounded(estimatedCostUsd(usage)),
            estimatedCostKrwAt1400: rounded(estimatedCostUsd(usage) * 1_400, 2),
          },
          summary: buildSummary(),
        }, null, 2));
        if (status !== "completed") process.exitCode = 1;
        return;
      }

      action = nextAction;
      writeReport();
    }

    throw new Error(`최대 대화 턴 ${maxTurns}회 안에 완료하지 못했습니다.`);
  } catch (error) {
    status = "stopped";
    errorMessage = safeMessage(error);
    failedChecks.push("evaluation_stopped");
    writeReport();
    console.error(JSON.stringify({
      completed: false,
      outputPath,
      error: errorMessage,
      usage: {
        ...usage,
        estimatedCostUsd: rounded(estimatedCostUsd(usage)),
        estimatedCostKrwAt1400: rounded(estimatedCostUsd(usage) * 1_400, 2),
      },
      summary: buildSummary(),
    }, null, 2));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(safeMessage(error));
  process.exit(1);
});
