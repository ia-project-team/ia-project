// 수정 1 검증: 특이 사례 질문 턴에서 모델이 다듬은 reply를 언제 채택/거부하는가.
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

import { runTurn } from "@/server/llm/multiturn";
import type { ConversationMessage, TurnOutput } from "@/core/schemas/turn";
import type { RagQuestionDecision } from "@/server/rag/questionSelector";

const QUESTION = "보증금 증액분에 대해 확정일자를 다시 받으셨나요?";

const RAG_QUESTION: RagQuestionDecision = {
  shouldAsk: true,
  question: QUESTION,
  targetFact: "증액분 확정일자 재발급 여부",
  sourceCaseIds: ["klac-round-1-row-12"],
  reason: "증액 사실이 있어 확인 필요",
};

const HISTORY: ConversationMessage[] = [
  { role: "user", content: "작년에 보증금을 3천만원 올려줬어요." },
];

function modelOutput(reply: string, phase: TurnOutput["phase"] = "collecting"): TurnOutput {
  return { reply, collected: [], phase, pendingRagAnswer: null };
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.OPENAI_BASE_URL;
});

describe("runTurn — 특이 사례 질문 reply 확정", () => {
  it("공감 문장 + 질문 원문이면 모델 문장을 그대로 쓴다", async () => {
    const reply = `보증금을 올려주셨군요. ${QUESTION}`;
    generateObjectMock.mockResolvedValue({ object: modelOutput(reply) });

    const output = await runTurn("m", HISTORY, RAG_QUESTION);

    expect(output.reply).toBe(reply);
    expect(output.phase).toBe("collecting");
  });

  it("질문 원문만 있어도 채택한다", async () => {
    generateObjectMock.mockResolvedValue({ object: modelOutput(QUESTION) });

    const output = await runTurn("m", HISTORY, RAG_QUESTION);

    expect(output.reply).toBe(QUESTION);
  });

  it("공백·줄바꿈만 다르면 채택한다", async () => {
    const reply = "네.  보증금 증액분에 대해\n확정일자를  다시 받으셨나요?";
    generateObjectMock.mockResolvedValue({ object: modelOutput(reply) });

    const output = await runTurn("m", HISTORY, RAG_QUESTION);

    expect(output.reply).toBe(reply);
  });

  it("질문 문구를 바꾸면 검증된 원문으로 폴백한다", async () => {
    generateObjectMock.mockResolvedValue({
      object: modelOutput("증액분 확정일자는 다시 받으셨어요?"),
    });

    const output = await runTurn("m", HISTORY, RAG_QUESTION);

    expect(output.reply).toBe(QUESTION);
  });

  it("다른 질문을 덧붙이면 폴백한다", async () => {
    generateObjectMock.mockResolvedValue({
      object: modelOutput(`${QUESTION} 그리고 전입신고는 하셨나요?`),
    });

    const output = await runTurn("m", HISTORY, RAG_QUESTION);

    expect(output.reply).toBe(QUESTION);
  });

  it("공감 자리에서 먼저 질문해도 폴백한다", async () => {
    generateObjectMock.mockResolvedValue({
      object: modelOutput(`계약서는 갖고 계신가요? ${QUESTION}`),
    });

    const output = await runTurn("m", HISTORY, RAG_QUESTION);

    expect(output.reply).toBe(QUESTION);
  });

  it("특이 질문이 없는 턴은 모델 출력을 건드리지 않는다", async () => {
    generateObjectMock.mockResolvedValue({
      object: modelOutput("필수 항목이 모두 확인되었습니다.", "ready_to_advise"),
    });

    const output = await runTurn("m", HISTORY, null);

    expect(output.reply).toBe("필수 항목이 모두 확인되었습니다.");
    expect(output.phase).toBe("ready_to_advise");
  });

  it("특이 질문이 있으면 phase를 collecting으로 강제한다", async () => {
    generateObjectMock.mockResolvedValue({
      object: modelOutput(`네. ${QUESTION}`, "ready_to_advise"),
    });

    const output = await runTurn("m", HISTORY, RAG_QUESTION);

    expect(output.phase).toBe("collecting");
  });

  it("프록시 모드에서도 같은 규칙이 적용된다", async () => {
    process.env.OPENAI_BASE_URL = "http://127.0.0.1:10531/v1";
    generateTextMock.mockResolvedValue({
      text: JSON.stringify(modelOutput("증액분 확정일자 다시 받으셨어요?")),
    });

    const output = await runTurn("m", HISTORY, RAG_QUESTION);

    expect(generateTextMock).toHaveBeenCalled();
    expect(output.reply).toBe(QUESTION);
  });
});
