// 수정 2 검증: 확인 완료·대기 중·미응답 사실을 모두 재질문 금지 대상으로 거르는가.
import { beforeEach, describe, expect, it, vi } from "vitest";

const generateTextMock = vi.fn();

vi.mock("ai", () => ({
  generateText: (...args: unknown[]) => generateTextMock(...args),
  Output: { object: (options: unknown) => options },
}));

vi.mock("@/server/llm/provider", () => {
  const openai = Object.assign((model: string) => ({ model }), {
    chat: (model: string) => ({ api: "chat", model }),
    responses: (model: string) => ({ api: "responses", model }),
    embedding: (model: string) => ({ model }),
  });
  return {
    getOpenAI: () => openai,
    getOpenAIMaxRetries: () => undefined,
    LUNA_PROVIDER_OPTIONS: {
      openai: { reasoningEffort: "medium", textVerbosity: "low" },
    },
    MULTITURN_MODEL: "test-model",
  };
});

import { selectRagQuestion } from "@/server/rag/questionSelector";
import type { PendingRagQuestion, RetrievedCase, StoredRagFact } from "@/core/rag/types";
import type { ConversationMessage } from "@/core/schemas/turn";

const USER_TEXT = "임대인이 얼마 전에 사망했다고 들었어요. 그 뒤로 연락이 안 됩니다.";
const HISTORY: ConversationMessage[] = [{ role: "user", content: USER_TEXT }];
const TARGET_FACT = "상속인 확정 여부";
const TRIGGER_QUESTION = "임대인의 상속인이 누구인지 현재 확정된 상태인가요?";
const TRIGGER_ID = "hug-casebook-trigger-19-landlord-death-heirs";

const CASES: RetrievedCase[] = [
  {
    id: "klac-round-1-row-12",
    dataset: "klac-round-1",
    sourceRow: 12,
    legalCategory: "임대차",
    issue: "임대인 사망 후 보증금 반환 상대방",
    serviceFit: "direct",
    question: "임대인이 사망한 경우 누구에게 보증금을 청구하나요?",
    answer: "상속인에게 청구합니다.",
    answerStatus: "complete",
    decisionReason: null,
    score: 0.72,
  },
];

const TRIGGER_CASE: RetrievedCase = {
  id: TRIGGER_ID,
  dataset: "hug-jeonse-damage-question-triggers-2025",
  sourceRow: 19,
  legalCategory: "전세피해 특이사례 질문",
  issue: "임대인 사망 후 상속인 확인",
  serviceFit: "conditional",
  question: TRIGGER_QUESTION,
  answer: null,
  answerStatus: "missing",
  decisionReason: "보증금 반환 요구 상대를 파악하려면 상속인 확인이 필요하다.",
  score: 0.82,
  recordType: "question_trigger",
  applicabilityGate: ["landlord_deceased"],
  matchedGates: ["landlord_deceased"],
  userSignals: ["임대인이 사망했다", "상속인이 누군지 모른다"],
  targetFact: TARGET_FACT,
  whyMaterial: "보증금 반환 요구 상대를 파악하려면 상속인 확인이 필요하다.",
};

const SECOND_TRIGGER_CASE: RetrievedCase = {
  ...TRIGGER_CASE,
  id: "test-trigger-landlord-death-renunciation",
  sourceRow: 20,
  issue: "임대인 사망 후 상속포기",
  question: "상속인들이 상속을 포기했는지 확인하셨나요?",
  targetFact: "상속포기 여부",
};

const CHECKLIST_TRIGGER_CASE: RetrievedCase = {
  ...TRIGGER_CASE,
  id: "test-trigger-generic-checklist-fact",
  question: "전입신고는 하셨나요?",
  targetFact: "전입신고 여부",
};

const UNSUPPORTED_AGENT_CASE: RetrievedCase = {
  ...CASES[0],
  id: "easylaw-housing-lease-qa-31f88ca82513965f",
  issue: "대리인의 계약 권한",
  question: "대리인이 계약했다면 위임장과 인감증명서를 받아야 하나요?",
};

function candidate(targetFact = TARGET_FACT) {
  return {
    question: "임대인이 사망한 뒤 상속인이 정해졌는지 알고 계신가요?",
    targetFact,
    sourceCaseIds: ["klac-round-1-row-12"],
    reason: "임대인 사망이 언급되어 청구 상대방이 달라진다",
    evidenceQuote: "임대인이 얼마 전에 사망했다고 들었어요",
  };
}

function triggerCandidate(overrides: Record<string, unknown> = {}) {
  return {
    question: TRIGGER_QUESTION,
    targetFact: TARGET_FACT,
    sourceCaseIds: [TRIGGER_ID],
    reason: "모델이 임의로 작성한 이유",
    evidenceQuote: "임대인이 얼마 전에 사망했다고 들었어요",
    ...overrides,
  };
}

function secondTriggerCandidate(overrides: Record<string, unknown> = {}) {
  return {
    question: SECOND_TRIGGER_CASE.question,
    targetFact: SECOND_TRIGGER_CASE.targetFact,
    sourceCaseIds: [SECOND_TRIGGER_CASE.id],
    reason: "상속포기 여부를 확인해야 함",
    evidenceQuote: "임대인이 얼마 전에 사망했다고 들었어요",
    ...overrides,
  };
}

function input(overrides: Record<string, unknown> = {}) {
  return {
    model: "m",
    history: HISTORY,
    cases: CASES,
    checklist: [],
    ragFacts: [] as StoredRagFact[],
    pendingQuestion: null as PendingRagQuestion | null,
    unansweredFacts: [] as string[],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.OPENAI_BASE_URL;
  generateTextMock.mockResolvedValue({ output: { candidates: [candidate()] } });
});

describe("selectRagQuestion — 검증된 트리거 전용 선택", () => {
  it("일반 사례만 검색되면 모델을 부르지 않고 질문하지 않는다", async () => {
    const decision = await selectRagQuestion(input());

    expect(decision.shouldAsk).toBe(false);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("사용자에게 없는 대리인 전제를 일반 사례에서 만들지 않는다", async () => {
    generateTextMock.mockResolvedValue({
      output: {
        candidates: [{
          question:
            "신탁회사 대신 다른 사람이 계약했다면 위임장과 인감증명서를 받으셨나요?",
          targetFact: "대리인의 계약 권한 서류 수령 여부",
          sourceCaseIds: [UNSUPPORTED_AGENT_CASE.id],
          reason: "신탁회사 명의가 언급됨",
          evidenceQuote: "등기명의가 신탁회사",
        }],
      },
    });

    const decision = await selectRagQuestion(input({
      history: [{
        role: "user",
        content: "등기명의가 신탁회사이고 수탁자 동의 자료는 확인하지 못했습니다.",
      }],
      cases: [UNSUPPORTED_AGENT_CASE],
    }));

    expect(decision.shouldAsk).toBe(false);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("검색 결과가 없으면 모델을 부르지 않는다", async () => {
    const decision = await selectRagQuestion(input({ cases: [] }));

    expect(decision.shouldAsk).toBe(false);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("적용 조건을 모두 충족하지 못한 트리거는 질문하지 않는다", async () => {
    const decision = await selectRagQuestion(input({
      cases: [{ ...TRIGGER_CASE, matchedGates: [] }],
    }));

    expect(decision.shouldAsk).toBe(false);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("적합한 질문 트리거가 하나면 모델 없이 저장 원문을 채택한다", async () => {
    generateTextMock.mockResolvedValue({
      output: { candidates: [triggerCandidate()] },
    });

    const decision = await selectRagQuestion(input({ cases: [...CASES, TRIGGER_CASE] }));

    expect(decision).toMatchObject({
      shouldAsk: true,
      question: TRIGGER_QUESTION,
      targetFact: TARGET_FACT,
      sourceCaseIds: [TRIGGER_ID],
      reason: TRIGGER_CASE.whyMaterial,
    });
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("이미 물어본 단일 트리거는 일반 사례가 함께 있어도 우회 생성하지 않는다", async () => {
    const decision = await selectRagQuestion(input({
      cases: [...CASES, TRIGGER_CASE],
      unansweredFacts: [TARGET_FACT],
    }));

    expect(decision.shouldAsk).toBe(false);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("이미 답변까지 저장한 단일 트리거는 다시 묻지 않는다", async () => {
    const decision = await selectRagQuestion(input({
      cases: [...CASES, TRIGGER_CASE],
      ragFacts: [{
        targetFact: TARGET_FACT,
        question: TRIGGER_QUESTION,
        answer: "정해지지 않음",
        sourceCaseIds: [TRIGGER_ID],
        askedAtTurn: 1,
        answeredAtTurn: 2,
      }],
    }));

    expect(decision.shouldAsk).toBe(false);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("답변 대기 중인 단일 트리거는 다시 묻지 않는다", async () => {
    const decision = await selectRagQuestion(input({
      cases: [TRIGGER_CASE],
      pendingQuestion: {
        targetFact: TARGET_FACT,
        question: TRIGGER_QUESTION,
        sourceCaseIds: [TRIGGER_ID],
        askedAtTurn: 1,
      },
    }));

    expect(decision.shouldAsk).toBe(false);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("체크리스트와 같은 사실을 묻는 트리거는 거부한다", async () => {
    const decision = await selectRagQuestion(input({
      cases: [CHECKLIST_TRIGGER_CASE],
    }));

    expect(decision.shouldAsk).toBe(false);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("복수 트리거에서 모델이 질문 원문을 고쳐 쓰면 거부한다", async () => {
    generateTextMock.mockResolvedValue({
      output: {
        candidates: [triggerCandidate({ question: "상속인이 있나요?" })],
      },
    });

    const decision = await selectRagQuestion(input({
      cases: [TRIGGER_CASE, SECOND_TRIGGER_CASE],
    }));

    expect(decision.shouldAsk).toBe(false);
    expect(generateTextMock).toHaveBeenCalledOnce();
    expect(generateTextMock).toHaveBeenCalledWith(expect.objectContaining({
      model: { api: "responses", model: "m" },
      providerOptions: {
        openai: { reasoningEffort: "medium", textVerbosity: "low" },
      },
    }));
  });

  it("복수 트리거 중 앞 후보가 차단되면 다음 검증 트리거를 채택한다", async () => {
    generateTextMock.mockResolvedValue({
      output: {
        candidates: [triggerCandidate(), secondTriggerCandidate()],
      },
    });

    const decision = await selectRagQuestion(input({
      cases: [TRIGGER_CASE, SECOND_TRIGGER_CASE],
      unansweredFacts: [TARGET_FACT],
    }));

    expect(decision.question).toBe(SECOND_TRIGGER_CASE.question);
    expect(decision.targetFact).toBe(SECOND_TRIGGER_CASE.targetFact);
    expect(decision.sourceCaseIds).toEqual([SECOND_TRIGGER_CASE.id]);
  });

  it("복수 트리거를 고를 때도 일반 사례는 모델 입력과 허용 후보에서 제외한다", async () => {
    generateTextMock.mockResolvedValue({
      output: {
        candidates: [candidate("상속포기 여부"), triggerCandidate()],
      },
    });

    const decision = await selectRagQuestion(input({
      cases: [...CASES, TRIGGER_CASE, SECOND_TRIGGER_CASE],
    }));

    expect(decision.question).toBe(TRIGGER_QUESTION);
    expect(decision.sourceCaseIds).toEqual([TRIGGER_ID]);
    expect(generateTextMock).toHaveBeenCalledOnce();
    const request = generateTextMock.mock.calls[0][0] as { system: string };
    expect(request.system).toContain(TRIGGER_QUESTION);
    expect(request.system).not.toContain(CASES[0].question);
  });
});
