import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { detectApplicabilityGates } from "../src/core/rag/retrievalText";

type TriggerRecord = {
  record_id: string;
  question: string;
  applicability_gate: string[];
};

type EvalPair = {
  triggerId: string;
  positiveInput: string;
  negativeInput: string;
  negativeMissingGates: string[];
};

type EvalDataset = {
  schemaVersion: string;
  description: string;
  pairs: EvalPair[];
};

type ScenarioKind = "positive" | "negative";

type UsageTotals = {
  apiCallsAttempted: number;
  embeddingInputTokens: number;
  lunaInputTokens: number;
  lunaCachedInputTokens: number;
  lunaOutputTokens: number;
  lunaReasoningTokens: number;
};

type ScenarioResult = {
  repeat: number;
  sequence: number;
  scenarioId: string;
  kind: ScenarioKind;
  triggerId: string;
  expectedQuestion: string;
  input: string;
  requiredGates: string[];
  detectedGates: string[];
  durationMs: number;
  retrievedCount: number;
  eligibleCount: number;
  expectedRetrieved: boolean;
  expectedEligible: boolean;
  selectorShouldAsk: boolean;
  selectorQuestion: string | null;
  selectorSourceCaseIds: string[];
  selectedAnyTrigger: boolean;
  finalReply: string;
  finalPhase: string;
  finalIsAnyTrigger: boolean;
  pass: boolean;
  failedChecks: string[];
  retrievedTop: Array<{
    id: string;
    recordType?: string;
    question: string;
    score: number;
    matchedGates?: string[];
  }>;
};

const ROOT = process.cwd();
const TRIGGER_PATH = path.join(
  ROOT,
  "data/rag/deduplicated/question_triggers.jsonl",
);
const DATASET_PATH = path.join(
  ROOT,
  "data/rag/eval/trigger-pair-cases.json",
);

function parseIntegerArg(name: string, fallback: number): number {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name}은 양의 정수여야 합니다.`);
  }
  return parsed;
}

function parseNumberArg(name: string, fallback: number): number {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name}은 0보다 큰 숫자여야 합니다.`);
  }
  return parsed;
}

function loadJsonl<T>(filePath: string): T[] {
  return fs.readFileSync(filePath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

function loadDataset(): EvalDataset {
  return JSON.parse(fs.readFileSync(DATASET_PATH, "utf8")) as EvalDataset;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function validateDataset(
  triggers: TriggerRecord[],
  dataset: EvalDataset,
): Map<string, TriggerRecord> {
  const errors: string[] = [];
  const triggerById = new Map(triggers.map((trigger) => [trigger.record_id, trigger]));
  const pairIds = dataset.pairs.map((pair) => pair.triggerId);

  if (triggers.length !== 22) errors.push(`트리거가 22개가 아님: ${triggers.length}`);
  if (dataset.pairs.length !== 22) {
    errors.push(`평가 쌍이 22개가 아님: ${dataset.pairs.length}`);
  }
  if (new Set(pairIds).size !== pairIds.length) errors.push("평가 쌍 ID가 중복됨");

  for (const trigger of triggers) {
    if (!pairIds.includes(trigger.record_id)) {
      errors.push(`평가 쌍 누락: ${trigger.record_id}`);
    }
  }

  const allInputs: string[] = [];
  for (const pair of dataset.pairs) {
    const trigger = triggerById.get(pair.triggerId);
    if (!trigger) {
      errors.push(`존재하지 않는 트리거 ID: ${pair.triggerId}`);
      continue;
    }

    allInputs.push(pair.positiveInput, pair.negativeInput);
    const positiveGates = new Set(detectApplicabilityGates(pair.positiveInput));
    const negativeGates = new Set(detectApplicabilityGates(pair.negativeInput));
    const required = unique(trigger.applicability_gate);
    const missing = unique(pair.negativeMissingGates);

    for (const gate of required) {
      if (!positiveGates.has(gate)) {
        errors.push(`${pair.triggerId} 정상 사례가 조건을 감지하지 못함: ${gate}`);
      }
    }
    for (const gate of missing) {
      if (!required.includes(gate)) {
        errors.push(`${pair.triggerId} 제외 조건이 트리거 조건에 없음: ${gate}`);
      }
      if (negativeGates.has(gate)) {
        errors.push(`${pair.triggerId} 오탐 방지 사례에서 제외 조건이 감지됨: ${gate}`);
      }
    }
    for (const gate of required.filter((gate) => !missing.includes(gate))) {
      if (!negativeGates.has(gate)) {
        errors.push(`${pair.triggerId} 오탐 방지 사례가 근접 조건을 잃음: ${gate}`);
      }
    }
    if (required.every((gate) => negativeGates.has(gate))) {
      errors.push(`${pair.triggerId} 오탐 방지 사례가 모든 적용 조건을 충족함`);
    }
  }

  if (new Set(allInputs).size !== allInputs.length) {
    errors.push("평가 입력 문장이 중복됨");
  }
  if (errors.length > 0) {
    throw new Error(`평가셋 검증 실패:\n- ${errors.join("\n- ")}`);
  }
  return triggerById;
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

function safeMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/sk-[A-Za-z0-9_*.-]+/gu, "[redacted-api-key]")
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/giu, "Bearer [redacted]");
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
    url.pathname.endsWith(suffix)
  );
}

function usageNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function collectUsage(
  body: unknown,
  url: URL,
  usage: UsageTotals,
): void {
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
        // 응답 본문이 JSON이 아니어도 실제 SDK 처리는 원래 응답으로 계속한다.
      }
    }
    return response;
  }) as typeof fetch;
}

function summarize(results: ScenarioResult[]) {
  const positives = results.filter((result) => result.kind === "positive");
  const negatives = results.filter((result) => result.kind === "negative");
  const scenarioGroups = new Map<string, ScenarioResult[]>();
  for (const result of results) {
    const group = scenarioGroups.get(result.scenarioId) ?? [];
    group.push(result);
    scenarioGroups.set(result.scenarioId, group);
  }
  const stablePasses = [...scenarioGroups.values()].filter((group) =>
    group.length > 0 && group.every((result) => result.pass)
  ).length;
  const inconsistent = [...scenarioGroups.values()].filter((group) => {
    const outcomes = new Set(group.map((result) => result.pass));
    return outcomes.size > 1;
  }).length;
  const ratio = (numerator: number, denominator: number) =>
    denominator === 0 ? 0 : rounded(numerator / denominator, 4);

  return {
    completedRuns: results.length,
    passedRuns: results.filter((result) => result.pass).length,
    overallPassRate: ratio(
      results.filter((result) => result.pass).length,
      results.length,
    ),
    positive: {
      runs: positives.length,
      passRate: ratio(positives.filter((result) => result.pass).length, positives.length),
      retrievalRecall: ratio(
        positives.filter((result) => result.expectedRetrieved).length,
        positives.length,
      ),
      eligibleRecall: ratio(
        positives.filter((result) => result.expectedEligible).length,
        positives.length,
      ),
      selectorExactAccuracy: ratio(
        positives.filter((result) => result.selectorQuestion === result.expectedQuestion).length,
        positives.length,
      ),
      finalExactAccuracy: ratio(
        positives.filter((result) => result.finalReply === result.expectedQuestion).length,
        positives.length,
      ),
    },
    negative: {
      runs: negatives.length,
      passRate: ratio(negatives.filter((result) => result.pass).length, negatives.length),
      pairedTargetLeakRate: ratio(
        negatives.filter((result) => result.expectedEligible).length,
        negatives.length,
      ),
      anyTriggerSelectionRate: ratio(
        negatives.filter((result) => result.selectedAnyTrigger).length,
        negatives.length,
      ),
      anyTriggerFinalRate: ratio(
        negatives.filter((result) => result.finalIsAnyTrigger).length,
        negatives.length,
      ),
    },
    stability: {
      scenarioCount: scenarioGroups.size,
      stablePasses,
      inconsistent,
    },
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const repetitions = parseIntegerArg("repetitions", 3);
  const limit = parseIntegerArg("limit", Number.MAX_SAFE_INTEGER);
  const maxCostUsd = parseNumberArg("max-cost-usd", 2);
  const triggers = loadJsonl<TriggerRecord>(TRIGGER_PATH);
  const dataset = loadDataset();
  const triggerById = validateDataset(triggers, dataset);
  const datasetSha256 = crypto
    .createHash("sha256")
    .update(fs.readFileSync(DATASET_PATH))
    .digest("hex");

  if (dryRun) {
    console.log(JSON.stringify({
      ok: true,
      dryRun: true,
      triggerCount: triggers.length,
      pairCount: dataset.pairs.length,
      expandedScenarioCount: dataset.pairs.length * 2,
      repetitions,
      totalRuns: dataset.pairs.length * 2 * repetitions,
      datasetSha256,
    }, null, 2));
    return;
  }

  const totalAvailableRuns = dataset.pairs.length * 2 * repetitions;
  const totalRuns = Math.min(totalAvailableRuns, limit);
  const maxApiCalls = totalRuns * 3;
  const usage: UsageTotals = {
    apiCallsAttempted: 0,
    embeddingInputTokens: 0,
    lunaInputTokens: 0,
    lunaCachedInputTokens: 0,
    lunaOutputTokens: 0,
    lunaReasoningTokens: 0,
  };
  installUsageTracker(usage, maxApiCalls, maxCostUsd);

  const [policy, provider, multiturn, selector, retriever] = await Promise.all([
    import("../src/core/rag/retrievalPolicy"),
    import("../src/server/llm/provider"),
    import("../src/server/llm/multiturn"),
    import("../src/server/rag/questionSelector"),
    import("../src/server/rag/retriever"),
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

  const runStartedAt = new Date();
  const timestamp = runStartedAt.toISOString().replace(/[:.]/g, "-");
  const outputPath = path.join(
    ROOT,
    "data/rag/eval/results",
    `trigger-eval-${timestamp}.json`,
  );
  const results: ScenarioResult[] = [];
  const triggerQuestionSet = new Set(triggers.map((trigger) => trigger.question));

  const writeReport = (status: "running" | "completed" | "stopped", error?: string) => {
    const report = {
      schemaVersion: "1.0",
      status,
      error,
      startedAt: runStartedAt.toISOString(),
      updatedAt: new Date().toISOString(),
      model: provider.MULTITURN_MODEL,
      keySource: process.env.RAG_EVAL_KEY_SOURCE ?? "unspecified",
      retries: provider.getOpenAIMaxRetries(),
      repetitions,
      plannedRuns: totalRuns,
      datasetPath: path.relative(ROOT, DATASET_PATH),
      datasetSha256,
      safety: { maxApiCalls, maxCostUsd },
      usage: {
        ...usage,
        estimatedCostUsd: rounded(estimatedCostUsd(usage)),
      },
      summary: summarize(results),
      results,
    };
    fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  };

  let sequence = 0;
  try {
    outer:
    for (let repeat = 1; repeat <= repetitions; repeat += 1) {
      for (const pair of dataset.pairs) {
        for (const kind of ["positive", "negative"] as const) {
          if (sequence >= totalRuns) break outer;
          sequence += 1;
          const trigger = triggerById.get(pair.triggerId);
          if (!trigger) throw new Error(`트리거를 찾을 수 없음: ${pair.triggerId}`);
          const input = kind === "positive" ? pair.positiveInput : pair.negativeInput;
          const startedAt = Date.now();
          const history = [{ role: "user" as const, content: input }];
          const searchQuery = policy.buildRagSearchQuery({
            currentMessage: input,
            recentUserMessages: [],
            collectedFacts: [],
            ragFacts: [],
          });

          const retrieved = await retriever.retrieve(searchQuery, 16);
          const selected = policy.selectRagCandidates(retrieved);
          const expectedRetrieved = retrieved.some((item) =>
            item.recordType === "question_trigger" && item.question === trigger.question
          );
          const expectedEligible = selected.cases.some((item) =>
            item.recordType === "question_trigger" && item.question === trigger.question
          );
          const decision = await selector.selectRagQuestion({
            model: provider.MULTITURN_MODEL,
            history,
            cases: selected.cases,
            checklist: [],
            ragFacts: [],
            pendingQuestion: null,
            unansweredFacts: [],
          });
          const casesById = new Map(selected.cases.map((item) => [item.id, item]));
          const selectedAnyTrigger = decision.sourceCaseIds.some((id) =>
            casesById.get(id)?.recordType === "question_trigger"
          );
          const output = await multiturn.runTurn(
            provider.MULTITURN_MODEL,
            history,
            decision,
            [],
            [],
            null,
          );
          const finalIsAnyTrigger = triggerQuestionSet.has(output.reply);
          const failedChecks: string[] = [];

          if (kind === "positive") {
            if (!expectedRetrieved) failedChecks.push("expected_trigger_not_retrieved");
            if (!expectedEligible) failedChecks.push("expected_trigger_not_eligible");
            if (decision.question !== trigger.question) {
              failedChecks.push("selector_question_mismatch");
            }
            if (output.reply !== trigger.question) failedChecks.push("final_reply_mismatch");
          } else {
            if (expectedEligible) failedChecks.push("paired_target_became_eligible");
            if (selectedAnyTrigger) failedChecks.push("unexpected_trigger_selected");
            if (finalIsAnyTrigger) failedChecks.push("unexpected_trigger_in_final_reply");
          }
          if (output.phase !== "collecting") failedChecks.push("phase_not_collecting");

          const result: ScenarioResult = {
            repeat,
            sequence,
            scenarioId: `${pair.triggerId}:${kind}`,
            kind,
            triggerId: pair.triggerId,
            expectedQuestion: trigger.question,
            input,
            requiredGates: trigger.applicability_gate,
            detectedGates: detectApplicabilityGates(input),
            durationMs: Date.now() - startedAt,
            retrievedCount: retrieved.length,
            eligibleCount: selected.cases.length,
            expectedRetrieved,
            expectedEligible,
            selectorShouldAsk: decision.shouldAsk,
            selectorQuestion: decision.question,
            selectorSourceCaseIds: decision.sourceCaseIds,
            selectedAnyTrigger,
            finalReply: output.reply,
            finalPhase: output.phase,
            finalIsAnyTrigger,
            pass: failedChecks.length === 0,
            failedChecks,
            retrievedTop: retrieved.slice(0, 6).map((item) => ({
              id: item.id,
              recordType: item.recordType,
              question: item.question,
              score: rounded(item.score, 5),
              matchedGates: item.matchedGates,
            })),
          };
          results.push(result);
          writeReport("running");
          console.log(JSON.stringify({
            progress: `${sequence}/${totalRuns}`,
            repeat,
            scenarioId: result.scenarioId,
            pass: result.pass,
            failedChecks,
            apiCalls: usage.apiCallsAttempted,
            estimatedCostUsd: rounded(estimatedCostUsd(usage)),
            durationSeconds: rounded(result.durationMs / 1000, 1),
          }));

          if (sequence === Math.min(5, totalRuns)) {
            const pilotPositives = results.filter((item) => item.kind === "positive");
            if (
              pilotPositives.length > 0 &&
              pilotPositives.every((item) => !item.expectedRetrieved)
            ) {
              throw new Error("파일럿 정상 사례에서 기대 트리거가 한 건도 검색되지 않았습니다.");
            }
            console.log(JSON.stringify({
              pilot: "passed_infrastructure_guard",
              completed: sequence,
              summary: summarize(results),
            }));
          }
        }
      }
    }

    writeReport("completed");
    console.log(JSON.stringify({
      completed: true,
      outputPath,
      usage: {
        ...usage,
        estimatedCostUsd: rounded(estimatedCostUsd(usage)),
      },
      summary: summarize(results),
    }, null, 2));
  } catch (error) {
    const message = safeMessage(error);
    writeReport("stopped", message);
    console.error(JSON.stringify({
      completed: false,
      stoppedAt: sequence,
      outputPath,
      error: message,
      usage: {
        ...usage,
        estimatedCostUsd: rounded(estimatedCostUsd(usage)),
      },
      summary: summarize(results),
    }, null, 2));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(safeMessage(error));
  process.exit(1);
});
