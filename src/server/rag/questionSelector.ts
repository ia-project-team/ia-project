// 검색된 실제 상담사례에서 체크리스트 밖의 특이 확인질문 하나를 고른다.
import "server-only";

import { generateObject, generateText } from "ai";
import { z } from "zod";

import { CHECKLIST, checklistToText } from "@/core/checklist";
import type {
  PendingRagQuestion,
  RetrievedCase,
  StoredRagFact,
} from "@/core/rag/types";
import type { CollectedItem, ConversationMessage } from "@/core/schemas/turn";
import { getOpenAI } from "@/server/llm/provider";

/** selectRagQuestion 입력. 인자가 많아 객체로 받는다. */
export type RagQuestionInput = {
  model: string;
  history: ConversationMessage[];
  cases: RetrievedCase[];
  checklist: CollectedItem[];
  /** 답변까지 확인된 특이 사실. */
  ragFacts: StoredRagFact[];
  /** 아직 답변 대기 중인 직전 질문. 답변 여부는 이 시점에 알 수 없다. */
  pendingQuestion: PendingRagQuestion | null;
  /** 물었지만 답을 얻지 못한 targetFact. 반복 질문을 막는다. */
  unansweredFacts: string[];
};

const RagQuestionCandidateSchema = z.object({
  question: z.string(),
  targetFact: z.string(),
  sourceCaseIds: z.array(z.string()),
  reason: z.string(),
  evidenceQuote: z.string(),
}).strict();

const RagQuestionSelectionSchema = z.object({
  candidates: z.array(RagQuestionCandidateSchema).max(3),
}).strict();

export type RagQuestionDecision = {
  shouldAsk: boolean;
  question: string | null;
  targetFact: string | null;
  sourceCaseIds: string[];
  reason: string | null;
};

type RagQuestionCandidate = z.infer<typeof RagQuestionCandidateSchema>;

const GENERIC_FACT_ALIASES = [
  ...CHECKLIST.map((item) => item.label),
  "계약서 보유 여부",
  "계약 시작일",
  "계약 종료일",
  "보증금 액수",
  "미반환 금액",
  "전입신고 여부",
  "확정일자 여부",
  "퇴거 여부",
  "계약 종료 통보 시점",
  "계약 종료 통보 방식",
  "임대인 답변 여부",
  "문자 내역",
  "내용증명 여부",
  "계좌이체 내역",
  "임차권등기명령 신청 여부",
  "등기부 선순위 권리",
].map(normalizeForComparison);

function normalizeForComparison(value: string): string {
  return value.normalize("NFC").replace(/\s+/g, "").replace(/[?？.,·/()]/g, "");
}

/** 공백만 정규화해 원문 대조에 쓴다. 선택된 질문이 reply에 그대로 담겼는지 확인할 때도 사용. */
export function normalizeForQuote(value: string): string {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

function isGenericChecklistFact(targetFact: string): boolean {
  const normalized = normalizeForComparison(targetFact)
    .replace(/확인$/, "")
    .replace(/여부$/, "");

  // 시점 표현을 덧붙여도 수집하려는 사실 자체가 동일한 항목은 RAG 질문이 아니다.
  if (normalized.includes("임차권등기명령")) return true;

  // 일반 확정일자는 체크리스트지만, 갱신·증액분에 다시 받은 확정일자는 사례 특이 질문이다.
  if (
    normalized.includes("확정일자") &&
    !/(증액|갱신|재계약|추가보증금)/.test(normalized)
  ) return true;

  return GENERIC_FACT_ALIASES.some((alias) => {
    const generic = alias.replace(/여부$/, "");
    return normalized === generic || normalized === `${generic}확인`;
  });
}

function isCompoundQuestion(question: string): boolean {
  return (question.match(/[?？]/g)?.length ?? 0) > 1 ||
    /아니면|혹은.+(?:인가요|나요)|또는.+(?:인가요|나요)/.test(question);
}

function repeatsExplicitUserFact(question: string, userText: string): string | null {
  const explicitFactTerms = [
    "계약서",
    "전입신고",
    "확정일자",
    "임차권등기명령",
    "내용증명",
    "계좌이체",
  ];
  return explicitFactTerms.find((term) =>
    question.includes(term) && userText.includes(term),
  ) ?? null;
}

/** 이미 확인했거나 이미 물어본 사실과 겹치면 그 사실을 돌려준다. */
function findBlockingFact(
  targetFact: string,
  blockedFacts: string[],
): string | null {
  const normalizedTarget = normalizeForComparison(targetFact);
  return blockedFacts.find((fact) => {
    const normalized = normalizeForComparison(fact);
    return normalizedTarget === normalized ||
      normalizedTarget.includes(normalized) ||
      normalized.includes(normalizedTarget);
  }) ?? null;
}

function validateCandidate(
  candidate: RagQuestionCandidate,
  allowedCaseIds: Set<string>,
  userText: string,
  blockedFacts: string[],
): { decision?: RagQuestionDecision; rejection?: string } {
  const question = candidate.question.trim();
  const targetFact = candidate.targetFact.trim();
  const evidenceQuote = normalizeForQuote(candidate.evidenceQuote);
  const sourceCaseIds = [...new Set(candidate.sourceCaseIds)]
    .filter((id) => allowedCaseIds.has(id));

  if (!question || !targetFact) return { rejection: "질문 또는 targetFact가 비어 있음" };
  if (sourceCaseIds.length === 0) return { rejection: "검색 결과에 없는 사례 ID" };
  if (isGenericChecklistFact(`${targetFact} ${question}`)) {
    return { rejection: `체크리스트 중복: ${targetFact}` };
  }
  const blockingFact = findBlockingFact(targetFact, blockedFacts);
  if (blockingFact) {
    return { rejection: `이미 확인했거나 물어본 사실과 중복: ${blockingFact}` };
  }
  if (isCompoundQuestion(question)) return { rejection: "두 가지 이상을 묻는 복합 질문" };
  const repeatedFact = repeatsExplicitUserFact(question, userText);
  if (repeatedFact) return { rejection: `사용자가 이미 언급한 사실 반복: ${repeatedFact}` };
  if (!evidenceQuote || !normalizeForQuote(userText).includes(evidenceQuote)) {
    return { rejection: `사용자 발화에서 근거 문구를 찾을 수 없음: ${candidate.evidenceQuote}` };
  }

  return {
    decision: {
      shouldAsk: true,
      question,
      targetFact,
      sourceCaseIds,
      reason: candidate.reason.trim(),
    },
  };
}

function formatCases(cases: RetrievedCase[]): string {
  return cases.map((caseItem, index) => [
    `<case index="${index + 1}" id="${caseItem.id}" fit="${caseItem.serviceFit}" answer-status="${caseItem.answerStatus}">`,
    `법률분류: ${caseItem.legalCategory}`,
    `핵심쟁점: ${caseItem.issue ?? "미분류"}`,
    `사례질문: ${caseItem.question}`,
    caseItem.answer
      ? `사례답변 요지: ${caseItem.answer.slice(0, 1000)}`
      : "사례답변: 없음",
    caseItem.decisionReason
      ? `서비스 관련성: ${caseItem.decisionReason}`
      : null,
    "</case>",
  ].filter((line): line is string => line !== null).join("\n")).join("\n\n");
}

function formatSessionContext(
  checklist: CollectedItem[],
  ragFacts: StoredRagFact[],
  pendingQuestion: PendingRagQuestion | null,
  unansweredFacts: string[],
): string {
  const checklistText = checklist.length > 0
    ? checklist.map((item) =>
      `- ${item.key}: ${item.status}${item.value ? ` (${item.value})` : ""}`
    ).join("\n")
    : "- 저장된 체크리스트 상태 없음";
  const ragFactText = ragFacts.length > 0
    ? ragFacts.map((fact) =>
      `- ${fact.targetFact}: ${fact.answer} (질문: ${fact.question})`
    ).join("\n")
    : "- 저장된 RAG 확인 사실 없음";
  const askedText = [
    ...(pendingQuestion ? [pendingQuestion.targetFact] : []),
    ...unansweredFacts,
  ];

  return `# 세션에 저장된 현재 상태
## 체크리스트
${checklistText}

## 이미 질문하고 답변받은 RAG 특이 사실
${ragFactText}

## 이미 물어본 RAG 특이 사실 (답변 확보 여부와 무관)
${askedText.length > 0 ? askedText.map((fact) => `- ${fact}`).join("\n") : "- 없음"}

위 목록에 있는 사실은 확인 여부와 관계없이 다시 묻지 마세요.`;
}

function systemPrompt(
  cases: RetrievedCase[],
  checklist: CollectedItem[],
  ragFacts: StoredRagFact[],
  pendingQuestion: PendingRagQuestion | null,
  unansweredFacts: string[],
): string {
  return `당신은 전세보증금 반환 상담의 '특이 사례 질문 분석기'입니다.

일반 체크리스트가 놓칠 수 있는 예외적 사실을 검색된 실제 상담사례에서 발견해,
현재 사용자에게 지금 확인할 가치가 있는 추가 질문이 있는지를 판단합니다.

# 일반 체크리스트
${checklistToText()}

# 검색된 실제 상담사례
${formatCases(cases)}

${formatSessionContext(checklist, ragFacts, pendingQuestion, unansweredFacts)}

# 판단 규칙
1. 대화 전체와 검색 사례의 사실관계가 실질적으로 유사해야 합니다. 단순히 임대차·보증금·경매라는 단어만 같은 것은 부족합니다.
2. 일반 체크리스트와 의미가 같은 질문은 만들지 마세요.
3. 사용자가 이미 답했거나 대화에서 명확히 추론되는 사실은 다시 묻지 마세요.
4. 검색 사례에서 법적 판단·대응을 달라지게 하는 구별 사실만 질문 후보로 삼으세요.
5. 현재 사건에서 발생할 단서가 없는 희귀 상황을 억지로 묻지 마세요.
6. 질문은 한 번에 한 가지 사실만, 사용자가 이해하기 쉬운 한국어로 물으세요.
7. 사례의 법률적 결론을 설명하거나 사용자 사건에 적용하지 마세요.
8. 답변 없는 사례는 사실관계 비교에만 사용할 수 있습니다.
9. 적절한 특이 질문이 없으면 candidates를 빈 배열로 반환하세요. 질문을 만들지 않는 것도 정상입니다.
10. '계약서 보유, 계약일, 보증금·미반환액, 전입신고, 일반 확정일자, 퇴거, 종료 통보, 증거자료,
    임차권등기명령 신청, 등기부 선순위 권리' 자체를 묻는 것은 금지합니다. 이는 체크리스트 질문입니다.
    다만 '보증금 증액분에 확정일자를 다시 받았는지'처럼 검색 사례 때문에 생긴 더 좁고 구체적인 질문은 허용합니다.
11. 중요도 순서대로 최대 3개의 후보를 반환하세요. 각 후보의 evidenceQuote에는 그 질문이 현재 사건에서
    필요한 이유가 드러나는 사용자의 실제 발화 일부를 글자 그대로 복사하세요. evidenceQuote가 질문의
    targetFact 자체에 이미 답하고 있다면 그 후보는 만들지 마세요.
12. 각 후보는 서로 다른 한 가지 사실을 물어야 하며 question, targetFact, sourceCaseIds, reason,
    evidenceQuote를 모두 채우세요.`;
}

function noQuestion(): RagQuestionDecision {
  return {
    shouldAsk: false,
    question: null,
    targetFact: null,
    sourceCaseIds: [],
    reason: null,
  };
}

export async function selectRagQuestion(
  input: RagQuestionInput,
): Promise<RagQuestionDecision> {
  const {
    model,
    history,
    cases,
    checklist,
    ragFacts,
    pendingQuestion,
    unansweredFacts,
  } = input;
  if (cases.length === 0) return noQuestion();

  const openai = getOpenAI();
  const system = systemPrompt(
    cases,
    checklist,
    ragFacts,
    pendingQuestion,
    unansweredFacts,
  );
  const allowedCaseIds = new Set(cases.map((caseItem) => caseItem.id));

  // 확인 완료·대기 중·미응답을 모두 재질문 금지 대상으로 본다.
  const blockedFacts = [
    ...ragFacts.map((fact) => fact.targetFact),
    ...(pendingQuestion ? [pendingQuestion.targetFact] : []),
    ...unansweredFacts,
  ];

  if (process.env.OPENAI_BASE_URL) {
    const { text } = await generateText({
      model: openai.chat(model),
      system: `${system}\n\n반드시 JSON 형식으로만 응답하세요. 다른 텍스트는 출력하지 마세요.`,
      messages: history,
    });
    const selection = RagQuestionSelectionSchema.parse(JSON.parse(text.trim()));
    return chooseCandidate(selection.candidates, allowedCaseIds, history, blockedFacts);
  }

  const { object } = await generateObject({
    model: openai(model),
    schema: RagQuestionSelectionSchema,
    system,
    messages: history,
  });
  return chooseCandidate(object.candidates, allowedCaseIds, history, blockedFacts);
}

function chooseCandidate(
  candidates: RagQuestionCandidate[],
  allowedCaseIds: Set<string>,
  history: ConversationMessage[],
  blockedFacts: string[],
): RagQuestionDecision {
  const userText = history
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");

  for (const candidate of candidates) {
    const result = validateCandidate(candidate, allowedCaseIds, userText, blockedFacts);
    if (result.decision) return result.decision;
    console.log("[rag] candidate rejected", {
      question: candidate.question,
      targetFact: candidate.targetFact,
      rejection: result.rejection,
    });
  }

  return noQuestion();
}
