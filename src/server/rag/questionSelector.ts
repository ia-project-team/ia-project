// 서버가 적용 조건을 확인한 질문 트리거에서 체크리스트 밖의 질문 하나를 고른다.
import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";

import { CHECKLIST, checklistToText } from "@/core/checklist";
import type {
  PendingRagQuestion,
  RetrievedCase,
  StoredRagFact,
} from "@/core/rag/types";
import { isQuestionTriggerApplicable } from "@/core/rag/retrievalPolicy";
import type { CollectedItem, ConversationMessage } from "@/core/schemas/turn";
import {
  getOpenAI,
  getOpenAIMaxRetries,
  LUNA_PROVIDER_OPTIONS,
} from "@/server/llm/provider";

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

/** 공백만 정규화해 저장된 질문 트리거 원문을 대조한다. */
function normalizeForQuote(value: string): string {
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
  allowedCases: Map<string, RetrievedCase>,
  userText: string,
  blockedFacts: string[],
): { decision?: RagQuestionDecision; rejection?: string } {
  let question = candidate.question.trim();
  let targetFact = candidate.targetFact.trim();
  let reason = candidate.reason.trim();
  const evidenceQuote = normalizeForQuote(candidate.evidenceQuote);
  const sourceCaseIds = [...new Set(candidate.sourceCaseIds)]
    .filter((id) => allowedCases.has(id));

  if (!question || !targetFact) return { rejection: "질문 또는 targetFact가 비어 있음" };
  if (sourceCaseIds.length === 0) return { rejection: "검색 결과에 없는 사례 ID" };

  const referencedTriggers = sourceCaseIds
    .map((id) => allowedCases.get(id))
    .filter((caseItem): caseItem is RetrievedCase =>
      caseItem?.recordType === "question_trigger"
    );
  const matchingTrigger = referencedTriggers.find((caseItem) =>
    caseItem.targetFact &&
    normalizeForQuote(caseItem.question) === normalizeForQuote(question) &&
    normalizeForQuote(caseItem.targetFact) === normalizeForQuote(targetFact)
  );

  if (referencedTriggers.length > 0 && !matchingTrigger) {
    return { rejection: "조건부 질문 트리거의 질문·targetFact 원문 불일치" };
  }
  if (matchingTrigger?.targetFact) {
    // 모델이 문장을 바꾸어도 사용자에게는 검수된 원문만 전달한다.
    question = matchingTrigger.question;
    targetFact = matchingTrigger.targetFact;
    reason = matchingTrigger.whyMaterial ?? reason;
    sourceCaseIds.splice(0, sourceCaseIds.length, matchingTrigger.id);
  }

  if (isGenericChecklistFact(targetFact) || isGenericChecklistFact(question)) {
    return { rejection: `체크리스트 중복: ${targetFact}` };
  }
  const blockingFact = findBlockingFact(targetFact, blockedFacts);
  if (blockingFact) {
    return { rejection: `이미 확인했거나 물어본 사실과 중복: ${blockingFact}` };
  }
  if (isCompoundQuestion(question)) return { rejection: "두 가지 이상을 묻는 복합 질문" };
  const repeatedFact = repeatsExplicitUserFact(question, userText);
  if (repeatedFact) return { rejection: `사용자가 이미 언급한 사실 반복: ${repeatedFact}` };
  const hasServerVerifiedTriggerEvidence = matchingTrigger !== undefined &&
    isQuestionTriggerApplicable(matchingTrigger);
  if (
    !hasServerVerifiedTriggerEvidence &&
    (!evidenceQuote || !normalizeForQuote(userText).includes(evidenceQuote))
  ) {
    return { rejection: `사용자 발화에서 근거 문구를 찾을 수 없음: ${candidate.evidenceQuote}` };
  }

  return {
    decision: {
      shouldAsk: true,
      question,
      targetFact,
      sourceCaseIds,
      reason,
    },
  };
}

function formatCases(cases: RetrievedCase[]): string {
  return cases.map((caseItem, index) => {
    const opening = `<case index="${index + 1}" id="${caseItem.id}" type="${caseItem.recordType ?? "case"}" fit="${caseItem.serviceFit}" answer-status="${caseItem.answerStatus}">`;
    if (caseItem.recordType === "question_trigger") {
      return [
        opening,
        "문서종류: 조건부 질문 트리거",
        `핵심쟁점: ${caseItem.issue ?? "미분류"}`,
        `사용자 단서 예시: ${(caseItem.userSignals ?? []).join(" / ")}`,
        `확인할 사실(원문): ${caseItem.targetFact ?? "없음"}`,
        `질문 원문: ${caseItem.question}`,
        `질문 이유: ${caseItem.whyMaterial ?? caseItem.decisionReason ?? "없음"}`,
        "이 트리거를 고르면 targetFact와 질문 원문을 글자 그대로 복사하세요.",
        "</case>",
      ].join("\n");
    }

    return [
      opening,
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
    ].filter((line): line is string => line !== null).join("\n");
  }).join("\n\n");
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
  return `당신은 전세보증금 반환 상담의 '검증된 추가 질문 선택기'입니다.

서버가 사용자 상황과 적용 조건을 대조해 아래 질문 트리거만 허용했습니다.
새 질문을 만들지 말고, 허용된 트리거 중 지금 물을 한 가지를 고르세요.

# 일반 체크리스트
${checklistToText()}

# 서버가 적용 조건을 확인한 질문 트리거
${formatCases(cases)}

${formatSessionContext(checklist, ragFacts, pendingQuestion, unansweredFacts)}

# 판단 규칙
1. 아래에 제시된 question_trigger 이외의 사례나 상식에서 질문을 만들지 마세요.
2. 선택한 트리거 하나의 ID만 sourceCaseIds에 넣으세요.
3. '확인할 사실(원문)'과 '질문 원문'을 요약하거나 고치지 말고 그대로 복사하세요.
4. 사용자가 이미 답했거나 이미 물어본 사실은 다시 선택하지 마세요.
5. 일반 체크리스트와 의미가 같은 질문은 선택하지 마세요.
6. 질문에 법률적 결론·절차·대응 방법을 덧붙이지 마세요.
7. 현재 대화에서 가장 먼저 확인할 가치가 있는 순서대로 최대 3개 후보를 반환하세요.
8. 각 후보의 evidenceQuote에는 해당 트리거가 필요한 단서가 드러나는 사용자 발화 일부를 그대로 복사하세요.
9. 물을 트리거가 없으면 candidates를 빈 배열로 반환하세요. 질문하지 않는 것도 정상입니다.`;
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

function parseJsonText(text: string): unknown {
  const trimmed = text.trim()
    .replace(/^```(?:json)?\s*/iu, "")
    .replace(/\s*```$/u, "")
    .trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  return JSON.parse(
    firstBrace >= 0 && lastBrace > firstBrace
      ? trimmed.slice(firstBrace, lastBrace + 1)
      : trimmed,
  ) as unknown;
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

  // 확인 완료·대기 중·미응답을 모두 재질문 금지 대상으로 본다.
  const blockedFacts = [
    ...ragFacts.map((fact) => fact.targetFact),
    ...(pendingQuestion ? [pendingQuestion.targetFact] : []),
    ...unansweredFacts,
  ];
  const userText = history
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");
  const applicableTriggers = cases.filter(
    (caseItem) =>
      caseItem.recordType === "question_trigger" &&
      isQuestionTriggerApplicable(caseItem),
  );
  // 일반 사례는 검색 참고자료일 뿐 사용자 질문의 직접 근거로 사용하지 않는다.
  // 서버가 적용 조건을 확인한 question_trigger가 없으면 Luna가 새 전제를
  // 만들어 질문하지 못하도록 여기서 종료한다.
  if (applicableTriggers.length === 0) return noQuestion();

  const allowedCases = new Map(
    applicableTriggers.map((caseItem) => [caseItem.id, caseItem]),
  );

  if (applicableTriggers.length === 1) {
    const [trigger] = applicableTriggers;
    const validated = validateCandidate(
      {
        question: trigger.question,
        targetFact: trigger.targetFact ?? "",
        sourceCaseIds: [trigger.id],
        reason: trigger.whyMaterial ?? trigger.decisionReason ?? "조건 일치 질문 트리거",
        evidenceQuote: "",
      },
      allowedCases,
      userText,
      blockedFacts,
    );
    if (validated.decision) return validated.decision;
    console.log("[rag] deterministic trigger rejected", {
      id: trigger.id,
      rejection: validated.rejection,
    });
    // 일반 사례로 우회해 새 질문을 만들지 않는다.
    return noQuestion();
  }

  const openai = getOpenAI();
  const system = systemPrompt(
    applicableTriggers,
    checklist,
    ragFacts,
    pendingQuestion,
    unansweredFacts,
  );

  if (process.env.OPENAI_BASE_URL) {
    const result = await generateText({
      model: openai.chat(model),
      output: Output.object({
        schema: RagQuestionSelectionSchema,
        name: "rag_question_selection",
        description: "검색 사례에서 고른 추가 확인 질문 후보",
      }),
      system: `${system}\n\n반드시 JSON 형식으로만 응답하세요. 다른 텍스트는 출력하지 마세요.`,
      messages: history,
      maxRetries: getOpenAIMaxRetries(),
    });
    const selection = RagQuestionSelectionSchema.parse(
      result.output ?? parseJsonText(result.text),
    );
    return chooseCandidate(selection.candidates, allowedCases, history, blockedFacts);
  }

  const result = await generateText({
    model: openai.responses(model),
    output: Output.object({
      schema: RagQuestionSelectionSchema,
      name: "rag_question_selection",
      description: "검증된 추가 질문 트리거에서 고른 질문 후보",
    }),
    system,
    messages: history,
    maxRetries: getOpenAIMaxRetries(),
    providerOptions: LUNA_PROVIDER_OPTIONS,
  });
  const selection = RagQuestionSelectionSchema.parse(result.output);
  return chooseCandidate(selection.candidates, allowedCases, history, blockedFacts);
}

function chooseCandidate(
  candidates: RagQuestionCandidate[],
  allowedCases: Map<string, RetrievedCase>,
  history: ConversationMessage[],
  blockedFacts: string[],
): RagQuestionDecision {
  const userText = history
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");

  for (const candidate of candidates) {
    const result = validateCandidate(candidate, allowedCases, userText, blockedFacts);
    if (result.decision) return result.decision;
    console.log("[rag] candidate rejected", {
      question: candidate.question,
      targetFact: candidate.targetFact,
      rejection: result.rejection,
    });
  }

  return noQuestion();
}
