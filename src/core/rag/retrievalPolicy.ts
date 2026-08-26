import { issueFamilyMatches, normalizeRetrievalText } from "./retrievalText";
import type { RetrievedCase } from "./types";

export type SearchQueryInput = {
  currentMessage: string;
  recentUserMessages: string[];
  collectedFacts: string[];
  ragFacts: string[];
};

export type RagCandidateSelection = {
  cases: RetrievedCase[];
  rawCount: number;
  eligibleCount: number;
  maximumCount: number;
  scoreFloor: number;
  cutoffReason: "empty" | "score_floor" | "score_drop" | "maximum" | "exhausted";
};

/** 조건부 질문은 복수 applicability gate가 모두 현재 대화에서 감지된 경우에만 사용한다. */
export function isQuestionTriggerApplicable(caseItem: RetrievedCase): boolean {
  if (caseItem.recordType !== "question_trigger") return true;
  const required = [...new Set(caseItem.applicabilityGate ?? [])];
  if (required.length === 0) return false;
  const matched = new Set(caseItem.matchedGates ?? []);
  return required.every((gate) => matched.has(gate));
}

function uniqueFactLines(values: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const value of values) {
    const compact = value.normalize("NFC").replace(/\s+/g, " ").trim();
    const key = normalizeRetrievalText(compact);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(compact);
  }
  return unique;
}

/** 현재 진술은 한 번만 두고, 이전에 확인된 사실은 구획을 나눠 검색어를 만든다. */
export function buildRagSearchQuery(input: SearchQueryInput): string {
  const current = input.currentMessage.normalize("NFC").replace(/\s+/g, " ").trim();
  const currentKey = normalizeRetrievalText(current);
  const recent = uniqueFactLines(input.recentUserMessages)
    .filter((value) => normalizeRetrievalText(value) !== currentKey)
    .slice(-4);
  const collected = uniqueFactLines(input.collectedFacts);
  const ragFacts = uniqueFactLines(input.ragFacts);

  return [
    `현재 진술: ${current}`,
    recent.length > 0 ? `이전 사용자 진술:\n${recent.map((value) => `- ${value}`).join("\n")}` : null,
    collected.length > 0 ? `확인된 기본 사실:\n${collected.map((value) => `- ${value}`).join("\n")}` : null,
    ragFacts.length > 0 ? `확인된 특이 사실:\n${ragFacts.map((value) => `- ${value}`).join("\n")}` : null,
  ].filter((section): section is string => section !== null).join("\n");
}

function diversifyCases(cases: RetrievedCase[]): RetrievedCase[] {
  const selected: RetrievedCase[] = [];
  for (const caseItem of cases) {
    const isTrigger = caseItem.recordType === "question_trigger";
    const hasSameKindIssue = selected.some((existing) =>
      (existing.recordType === "question_trigger") === isTrigger &&
      issueFamilyMatches(existing.issue, caseItem.issue)
    );
    // 검색 진단과 향후 트리거 보강 근거를 위해 일반 자료와 질문 트리거를
    // 서로 다른 종류로 취급한다. 실제 사용자 질문은 selector가 트리거로 제한한다.
    if (hasSameKindIssue) {
      continue;
    }
    selected.push(caseItem);
  }
  return selected.toSorted(
    (left, right) => right.score - left.score || left.id.localeCompare(right.id),
  );
}

/**
 * 일반 사례는 검색 방식과 점수 분포에 따라 3~8건을 고르고,
 * 조건을 모두 충족한 질문 트리거는 그 범위와 별도로 보존한다.
 * 하이브리드 점수는 Top1=1 상대 점수이고, Supabase 점수는 기존 코사인 임계값을 쓴다.
 */
export function selectRagCandidates(cases: RetrievedCase[]): RagCandidateSelection {
  const ranked = cases
    .filter((caseItem) =>
      Number.isFinite(caseItem.score) && isQuestionTriggerApplicable(caseItem)
    )
    .toSorted((left, right) => right.score - left.score || left.id.localeCompare(right.id));
  if (ranked.length === 0) {
    return {
      cases: [],
      rawCount: cases.length,
      eligibleCount: 0,
      maximumCount: 8,
      scoreFloor: 0,
      cutoffReason: "empty",
    };
  }

  const isHybrid = ranked.some(
    (caseItem) => caseItem.vectorRank !== undefined || caseItem.lexicalRank !== undefined,
  );
  const scoreFloor = isHybrid ? 0.58 : 0.35;
  const topScore = ranked[0].score;
  const relativeFloor = isHybrid ? topScore * 0.62 : scoreFloor;
  const applicableTriggers = ranked
    .filter((caseItem) => caseItem.recordType === "question_trigger")
    .toSorted((left, right) =>
      (right.applicabilityGate?.length ?? 0) -
        (left.applicabilityGate?.length ?? 0) ||
      right.score - left.score ||
      left.id.localeCompare(right.id)
    );
  const rankedGeneralCases = ranked.filter(
    (caseItem) => caseItem.recordType !== "question_trigger",
  );
  const eligibleGeneralCases = diversifyCases(
    rankedGeneralCases.filter((caseItem, index) =>
      index === 0 || caseItem.score >= Math.max(scoreFloor, relativeFloor)
    ),
  );
  const eligibleByScore = [...applicableTriggers, ...eligibleGeneralCases]
    .toSorted((left, right) => right.score - left.score || left.id.localeCompare(right.id));
  const topMargin = eligibleByScore.length > 1
    ? eligibleByScore[0].score - eligibleByScore[1].score
    : 1;
  const baseMaximumCount: 6 | 8 = topMargin >= (isHybrid ? 0.14 : 0.08) ? 6 : 8;
  // 조건을 모두 충족한 트리거는 점수·다양화·최대 개수 때문에 탈락시키지 않는다.
  const maximumCount = Math.max(baseMaximumCount, applicableTriggers.length);
  const minimumTotalCount = Math.min(3, eligibleByScore.length);
  const minimumGeneralCount = Math.max(
    0,
    minimumTotalCount - applicableTriggers.length,
  );
  const selectedGeneralCases: RetrievedCase[] = [];
  let cutoffReason: RagCandidateSelection["cutoffReason"] = "exhausted";

  for (const caseItem of eligibleGeneralCases) {
    if (applicableTriggers.length + selectedGeneralCases.length >= maximumCount) {
      cutoffReason = "maximum";
      break;
    }
    const previous = selectedGeneralCases.at(-1);
    const scoreDrop = previous ? previous.score - caseItem.score : 0;
    if (
      selectedGeneralCases.length >= minimumGeneralCount &&
      scoreDrop >= (isHybrid ? 0.11 : 0.045)
    ) {
      cutoffReason = "score_drop";
      break;
    }
    selectedGeneralCases.push(caseItem);
  }

  if (
    cutoffReason === "exhausted" &&
    eligibleGeneralCases.length < rankedGeneralCases.length
  ) {
    cutoffReason = "score_floor";
  }

  return {
    // 트리거를 앞에 두고, selector는 이 중 적용 가능한 트리거만 질문에 사용한다.
    cases: [...applicableTriggers, ...selectedGeneralCases],
    rawCount: cases.length,
    eligibleCount: eligibleByScore.length,
    maximumCount,
    scoreFloor,
    cutoffReason,
  };
}
