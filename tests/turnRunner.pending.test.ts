// 수정 2 검증: 직전 특이 질문의 답변 여부를 모델 판정에 따라 확정하는가.
import { beforeEach, describe, expect, it, vi } from "vitest";

const retrieveMock = vi.fn();
const selectRagQuestionMock = vi.fn();
const runTurnMock = vi.fn();

vi.mock("@/server/rag/retriever", () => ({
  retrieve: (...args: unknown[]) => retrieveMock(...args),
}));

vi.mock("@/server/rag/questionSelector", () => ({
  selectRagQuestion: (...args: unknown[]) => selectRagQuestionMock(...args),
}));

vi.mock("@/server/llm/multiturn", () => ({
  runTurn: (...args: unknown[]) => runTurnMock(...args),
}));

import { runSingleTurn } from "@/server/llm/turnRunner";
import { CHECKLIST } from "@/core/checklist";
import type { PendingRagQuestion } from "@/core/rag/types";
import type { CollectedItem, TurnOutput } from "@/core/schemas/turn";
import type { Session } from "@/server/session/sessionStore";

const PENDING: PendingRagQuestion = {
  targetFact: "증액분 확정일자 재발급 여부",
  question: "보증금 증액분에 대해 확정일자를 다시 받으셨나요?",
  sourceCaseIds: ["klac-round-1-row-12"],
  askedAtTurn: 2,
};

function session(overrides: Partial<Session> = {}): Session {
  return {
    sessionId: "s1",
    history: [
      { role: "user", content: "작년에 보증금을 3천만원 올려줬어요." },
      { role: "assistant", content: PENDING.question },
    ],
    collected: [],
    ragFacts: [],
    unansweredRagFacts: [],
    pendingRagQuestion: null,
    ...overrides,
  };
}

function modelOutput(pendingRagAnswer: string | null): TurnOutput {
  return {
    reply: "다음 질문입니다.",
    collected: [],
    phase: "collecting",
    pendingRagAnswer,
  };
}

function completedRequiredItems(): CollectedItem[] {
  return CHECKLIST
    .filter((item) => item.required)
    .map((item) => ({
      key: item.key,
      status: "confirmed" as const,
      value: "확인됨",
    }));
}

beforeEach(() => {
  vi.clearAllMocks();
  retrieveMock.mockResolvedValue([]);
  selectRagQuestionMock.mockResolvedValue({
    shouldAsk: false,
    question: null,
    targetFact: null,
    sourceCaseIds: [],
    reason: null,
  });
});

describe("runSingleTurn — 대기 중 특이 질문 확정", () => {
  it("체크리스트 16개를 모두 필수 항목으로 관리한다", () => {
    expect(CHECKLIST).toHaveLength(16);
    expect(CHECKLIST.every((item) => item.required)).toBe(true);
  });

  it("필수 항목이 남아 있으면 모델의 done을 collecting으로 보정한다", async () => {
    runTurnMock.mockResolvedValue({
      ...modelOutput(null),
      phase: "done",
      collected: [
        { key: "deposit_amount", status: "confirmed", value: "2억원" },
      ],
    });

    const result = await runSingleTurn("보증금은 2억원입니다.", session(), "m");

    expect(result.phase).toBe("collecting");
  });

  it("collecting으로 보정할 때 종료 문구를 누락 필수 항목 질문으로 교체한다", async () => {
    runTurnMock.mockResolvedValue({
      ...modelOutput(null),
      reply: "감사합니다. 필요한 정보가 모두 정리되었습니다.",
      phase: "done",
      collected: [
        { key: "deposit_amount", status: "confirmed", value: "2억원" },
      ],
    });
    const s = session();

    const result = await runSingleTurn("보증금은 2억원입니다.", s, "m");

    expect(result.reply).toBe("임대차 계약서는 가지고 계신가요?");
    expect(result.reply).not.toContain("감사합니다");
    expect(result.reply.endsWith("?")).toBe(true);
    expect(s.history.at(-1)?.content).toBe(result.reply);
  });

  it("필수 항목이 모두 충족되면 모델의 ready_to_advise를 유지한다", async () => {
    runTurnMock.mockResolvedValue({
      ...modelOutput(null),
      phase: "ready_to_advise",
      collected: completedRequiredItems(),
    });

    const result = await runSingleTurn("필수 내용을 모두 말씀드렸습니다.", session(), "m");

    expect(result.phase).toBe("ready_to_advise");
  });

  it("16개 중 하나라도 답하지 않았으면 상담을 완료하지 않는다", async () => {
    const allButLandlordResponse = completedRequiredItems().filter(
      (item) => item.key !== "landlord_responded",
    );
    runTurnMock.mockResolvedValue({
      ...modelOutput(null),
      reply: "필요한 내용을 모두 확인했습니다.",
      phase: "ready_to_advise",
      collected: allButLandlordResponse,
    });

    const result = await runSingleTurn("다 말씀드렸어요.", session(), "m");

    expect(result.phase).toBe("collecting");
  });

  it('필수 항목에 "모름"이라고 답해도 확인 완료로 인정한다', async () => {
    const collected = completedRequiredItems().map((item) =>
      item.key === "landlord_responded"
        ? { ...item, value: "모름" }
        : item,
    );
    runTurnMock.mockResolvedValue({
      ...modelOutput(null),
      phase: "ready_to_advise",
      collected,
    });

    const result = await runSingleTurn(
      "임대인이 답변했는지는 모르겠어요.",
      session(),
      "m",
    );

    expect(result.phase).toBe("ready_to_advise");
    expect(result.collected).toContainEqual(
      expect.objectContaining({
        key: "landlord_responded",
        status: "confirmed",
        value: "모름",
      }),
    );
  });

  it('필수 항목이 "해당 없음"이어도 확인 완료로 인정한다', async () => {
    const collected = completedRequiredItems().map((item) =>
      item.key === "has_certified_mail"
        ? { ...item, status: "not_applicable" as const, value: "해당 없음" }
        : item,
    );
    runTurnMock.mockResolvedValue({
      ...modelOutput(null),
      phase: "ready_to_advise",
      collected,
    });

    const result = await runSingleTurn(
      "내용증명은 해당 없어요.",
      session(),
      "m",
    );

    expect(result.phase).toBe("ready_to_advise");
  });

  it("필수 항목이 모두 충족돼도 모델의 done을 ready_to_advise로 강등한다", async () => {
    runTurnMock.mockResolvedValue({
      ...modelOutput(null),
      phase: "done",
      collected: completedRequiredItems(),
    });

    const result = await runSingleTurn("필수 내용을 모두 말씀드렸습니다.", session(), "m");

    expect(result.phase).toBe("ready_to_advise");
  });

  it("collected를 누적하고 confirmed 상태를 unknown으로 되돌리지 않는다", async () => {
    runTurnMock.mockResolvedValue({
      ...modelOutput(null),
      collected: [
        { key: "deposit_amount", status: "unknown", value: null },
        { key: "contract_end_date", status: "confirmed", value: "2026-12-31" },
      ],
    });
    const s = session({
      collected: [
        { key: "deposit_amount", status: "confirmed", value: "2억원" },
      ],
    });

    const result = await runSingleTurn("계약 종료일은 올해 말이에요.", s, "m");

    expect(s.collected).toEqual([
      { key: "deposit_amount", status: "confirmed", value: "2억원" },
      { key: "contract_end_date", status: "confirmed", value: "2026-12-31" },
    ]);
    expect(result.collected).toEqual(s.collected);
  });

  it("모델이 답변으로 인정하면 ragFacts에 저장한다", async () => {
    runTurnMock.mockResolvedValue(modelOutput("증액분에도 확정일자를 받음"));
    const s = session({ pendingRagQuestion: PENDING });

    await runSingleTurn("네, 증액분에도 다시 받았어요.", s, "m");

    expect(s.ragFacts).toHaveLength(1);
    expect(s.ragFacts[0]).toMatchObject({
      targetFact: PENDING.targetFact,
      question: PENDING.question,
      answer: "증액분에도 확정일자를 받음",
      askedAtTurn: 2,
      answeredAtTurn: 2,
    });
    expect(s.unansweredRagFacts).toEqual([]);
  });

  it('"모르겠다"도 답변이므로 저장한다', async () => {
    runTurnMock.mockResolvedValue(modelOutput("모름"));
    const s = session({ pendingRagQuestion: PENDING });

    await runSingleTurn("그건 잘 모르겠어요.", s, "m");

    expect(s.ragFacts).toHaveLength(1);
    expect(s.ragFacts[0].answer).toBe("모름");
    expect(s.unansweredRagFacts).toEqual([]);
  });

  it("질문과 무관한 발화는 사실로 저장하지 않고 미응답으로 기록한다", async () => {
    runTurnMock.mockResolvedValue(modelOutput(null));
    const s = session({ pendingRagQuestion: PENDING });

    await runSingleTurn("그런데 소송 비용은 얼마나 드나요?", s, "m");

    expect(s.ragFacts).toEqual([]);
    expect(s.unansweredRagFacts).toEqual([PENDING.targetFact]);
  });

  it("대기 중 질문이 없으면 어떤 사실도 만들지 않는다", async () => {
    runTurnMock.mockResolvedValue(modelOutput(null));
    const s = session();

    await runSingleTurn("보증금을 못 받고 있어요.", s, "m");

    expect(s.ragFacts).toEqual([]);
    expect(s.unansweredRagFacts).toEqual([]);
  });

  it("대기 중·미응답 사실을 selector에 재질문 금지 대상으로 넘긴다", async () => {
    runTurnMock.mockResolvedValue(modelOutput(null));
    retrieveMock.mockResolvedValue([
      { id: "c1", score: 0.9, issue: null, serviceFit: "direct" },
    ]);
    const s = session({
      pendingRagQuestion: PENDING,
      unansweredRagFacts: ["임대인 사망 여부"],
    });

    await runSingleTurn("네.", s, "m");

    expect(selectRagQuestionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pendingQuestion: PENDING,
        unansweredFacts: ["임대인 사망 여부"],
      }),
    );
  });

  it("새 특이 질문이 선택되면 다음 턴 대기 상태로 저장한다", async () => {
    runTurnMock.mockResolvedValue(modelOutput(null));
    retrieveMock.mockResolvedValue([
      { id: "c1", score: 0.9, issue: null, serviceFit: "direct" },
    ]);
    selectRagQuestionMock.mockResolvedValue({
      shouldAsk: true,
      question: "임대인이 사망한 뒤 상속인이 정해졌는지 알고 계신가요?",
      targetFact: "상속인 확정 여부",
      sourceCaseIds: ["c1"],
      reason: "사망 언급",
    });
    const s = session();

    await runSingleTurn("임대인이 사망했다고 들었어요.", s, "m");

    expect(s.pendingRagQuestion).toMatchObject({
      targetFact: "상속인 확정 여부",
      sourceCaseIds: ["c1"],
      askedAtTurn: 2,
    });
  });

  it("RAG 검색이 실패해도 턴은 진행되고 대기 질문 판정은 유지된다", async () => {
    retrieveMock.mockRejectedValue(new Error("supabase down"));
    runTurnMock.mockResolvedValue(modelOutput("받음"));
    const s = session({ pendingRagQuestion: PENDING });

    const result = await runSingleTurn("네, 받았어요.", s, "m");

    expect(result.reply).toBe("다음 질문입니다.");
    expect(s.ragFacts).toHaveLength(1);
    expect(s.pendingRagQuestion).toBeNull();
  });

  it("RAG 질문 뒤 체크리스트로 복귀해 16개를 모두 모은 뒤에만 완료한다", async () => {
    const ragDecision = {
      shouldAsk: true,
      question: "계약 당시 등기상 수탁자가 임대차에 동의했다는 자료가 있나요?",
      targetFact: "수탁자의 임대차 동의 또는 임대 권한 확인 여부",
      sourceCaseIds: ["hug-casebook-trigger-12-trustee-consent"],
      reason: "신탁부동산 계약 단서",
    };
    const noRagDecision = {
      shouldAsk: false,
      question: null,
      targetFact: null,
      sourceCaseIds: [],
      reason: null,
    };
    selectRagQuestionMock
      .mockResolvedValueOnce(ragDecision)
      .mockResolvedValue(noRagDecision);

    let answeredChecklistCount = 0;
    runTurnMock.mockImplementation(async (...args: unknown[]) => {
      const selectedRag = args[2] as typeof ragDecision | null;
      const pendingRag = args[5] as PendingRagQuestion | null;
      const unknownSnapshot: CollectedItem[] = CHECKLIST.map((item) => ({
        key: item.key,
        status: "unknown",
        value: null,
      }));

      if (selectedRag?.shouldAsk) {
        return {
          reply: selectedRag.question,
          collected: unknownSnapshot,
          phase: "collecting",
          pendingRagAnswer: null,
        } satisfies TurnOutput;
      }

      if (pendingRag) {
        return {
          reply: CHECKLIST[0].fallbackQuestion,
          collected: unknownSnapshot,
          phase: "collecting",
          pendingRagAnswer: "수탁자 동의 자료 없음",
        } satisfies TurnOutput;
      }

      answeredChecklistCount += 1;
      const collected: CollectedItem[] = CHECKLIST.map((item, index) =>
        index < answeredChecklistCount
          ? { key: item.key, status: "confirmed", value: `답변 ${index + 1}` }
          : { key: item.key, status: "unknown", value: null },
      );
      const allAnswered = answeredChecklistCount === CHECKLIST.length;

      return {
        reply: allAnswered
          ? "필요한 내용을 모두 확인했습니다."
          : CHECKLIST[answeredChecklistCount].fallbackQuestion,
        collected,
        phase: allAnswered ? "ready_to_advise" : "collecting",
        pendingRagAnswer: null,
      } satisfies TurnOutput;
    });

    const s = session({
      history: [],
      collected: [],
      ragFacts: [],
      unansweredRagFacts: [],
      pendingRagQuestion: null,
    });

    const first = await runSingleTurn(
      "등기명의가 신탁회사이고 수탁자 동의 여부를 확인하지 못했습니다.",
      s,
      "m",
    );
    expect(first.reply).toBe(ragDecision.question);
    expect(s.pendingRagQuestion?.targetFact).toBe(ragDecision.targetFact);

    const afterRag = await runSingleTurn(
      "아니요, 수탁자가 동의했다는 자료는 없습니다.",
      s,
      "m",
    );
    expect(afterRag.reply).toBe(CHECKLIST[0].fallbackQuestion);
    expect(s.ragFacts).toHaveLength(1);
    expect(s.ragFacts[0]).toMatchObject({
      targetFact: ragDecision.targetFact,
      answer: "수탁자 동의 자료 없음",
    });
    expect(s.pendingRagQuestion).toBeNull();

    let result = afterRag;
    for (let index = 0; index < CHECKLIST.length; index += 1) {
      result = await runSingleTurn(`체크리스트 답변 ${index + 1}`, s, "m");
      expect(result.phase).toBe(
        index === CHECKLIST.length - 1 ? "ready_to_advise" : "collecting",
      );
    }

    expect(result.collected).toHaveLength(16);
    expect(
      result.collected.every(
        (item) => item.status === "confirmed" || item.status === "not_applicable",
      ),
    ).toBe(true);
    expect(s.ragFacts).toHaveLength(1);
    expect(s.unansweredRagFacts).toEqual([]);
  });
});
