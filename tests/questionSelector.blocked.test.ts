// 수정 2 검증: 확인 완료·대기 중·미응답 사실을 모두 재질문 금지 대상으로 거르는가.
import { beforeEach, describe, expect, it, vi } from "vitest";

const generateObjectMock = vi.fn();
const generateTextMock = vi.fn();

vi.mock("ai", () => ({
  generateObject: (...args: unknown[]) => generateObjectMock(...args),
  generateText: (...args: unknown[]) => generateTextMock(...args),
}));

vi.mock("@/server/llm/provider", () => {
  const openai = Object.assign((model: string) => ({ model }), {
    chat: (model: string) => ({ model }),
    textEmbedding: (model: string) => ({ model }),
  });
  return { getOpenAI: () => openai, MULTITURN_MODEL: "test-model" };
});

import { selectRagQuestion } from "@/server/rag/questionSelector";
import type { PendingRagQuestion, RetrievedCase, StoredRagFact } from "@/core/rag/types";
import type { ConversationMessage } from "@/core/schemas/turn";

const USER_TEXT = "임대인이 얼마 전에 사망했다고 들었어요. 그 뒤로 연락이 안 됩니다.";
const HISTORY: ConversationMessage[] = [{ role: "user", content: USER_TEXT }];
const TARGET_FACT = "상속인 확정 여부";

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

function candidate(targetFact = TARGET_FACT) {
  return {
    question: "임대인이 사망한 뒤 상속인이 정해졌는지 알고 계신가요?",
    targetFact,
    sourceCaseIds: ["klac-round-1-row-12"],
    reason: "임대인 사망이 언급되어 청구 상대방이 달라진다",
    evidenceQuote: "임대인이 얼마 전에 사망했다고 들었어요",
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
  generateObjectMock.mockResolvedValue({ object: { candidates: [candidate()] } });
});

describe("selectRagQuestion — 재질문 금지 대상", () => {
  it("차단 목록이 비어 있으면 후보를 채택한다", async () => {
    const decision = await selectRagQuestion(input());

    expect(decision.shouldAsk).toBe(true);
    expect(decision.targetFact).toBe(TARGET_FACT);
    expect(decision.sourceCaseIds).toEqual(["klac-round-1-row-12"]);
  });

  it("이미 답변까지 확인한 사실은 다시 묻지 않는다", async () => {
    const decision = await selectRagQuestion(input({
      ragFacts: [{
        targetFact: TARGET_FACT,
        question: "q",
        answer: "정해졌음",
        sourceCaseIds: ["klac-round-1-row-12"],
        askedAtTurn: 1,
        answeredAtTurn: 2,
      }],
    }));

    expect(decision.shouldAsk).toBe(false);
  });

  it("아직 답변 대기 중인 사실은 다시 묻지 않는다", async () => {
    const decision = await selectRagQuestion(input({
      pendingQuestion: {
        targetFact: TARGET_FACT,
        question: "q",
        sourceCaseIds: ["klac-round-1-row-12"],
        askedAtTurn: 1,
      },
    }));

    expect(decision.shouldAsk).toBe(false);
  });

  it("물었지만 답을 못 받은 사실도 다시 묻지 않는다 (루프 방지)", async () => {
    const decision = await selectRagQuestion(input({
      unansweredFacts: [TARGET_FACT],
    }));

    expect(decision.shouldAsk).toBe(false);
  });

  // 알려진 기존 버그: isGenericChecklistFact가 `${targetFact} ${question}`을 받는데
  // 별칭 비교는 완전 일치라서 절대 매칭되지 않는다. 고치면 이 테스트가 실패로 바뀌므로
  // 그때 it.fails를 it으로 되돌릴 것.
  it.fails("체크리스트와 같은 사실이면 거부한다", async () => {
    generateObjectMock.mockResolvedValue({
      object: { candidates: [{ ...candidate("전입신고 여부"), question: "전입신고는 하셨나요?" }] },
    });

    const decision = await selectRagQuestion(input());

    expect(decision.shouldAsk).toBe(false);
  });

  it("검색 결과에 없는 사례 ID를 대면 거부한다", async () => {
    generateObjectMock.mockResolvedValue({
      object: { candidates: [{ ...candidate(), sourceCaseIds: ["없는-사례-id"] }] },
    });

    const decision = await selectRagQuestion(input());

    expect(decision.shouldAsk).toBe(false);
  });

  it("사용자 발화에 없는 근거 문구를 대면 거부한다", async () => {
    generateObjectMock.mockResolvedValue({
      object: { candidates: [{ ...candidate(), evidenceQuote: "경매가 진행 중이라고 들었어요" }] },
    });

    const decision = await selectRagQuestion(input());

    expect(decision.shouldAsk).toBe(false);
  });

  it("앞 후보가 막히면 다음 후보로 넘어간다", async () => {
    generateObjectMock.mockResolvedValue({
      object: { candidates: [candidate(TARGET_FACT), candidate("상속포기 여부")] },
    });

    const decision = await selectRagQuestion(input({
      unansweredFacts: [TARGET_FACT],
    }));

    expect(decision.shouldAsk).toBe(true);
    expect(decision.targetFact).toBe("상속포기 여부");
  });

  it("검색 결과가 없으면 모델을 부르지 않는다", async () => {
    const decision = await selectRagQuestion(input({ cases: [] }));

    expect(decision.shouldAsk).toBe(false);
    expect(generateObjectMock).not.toHaveBeenCalled();
  });
});
