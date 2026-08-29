import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  embed: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  in: vi.fn(),
  contains: vi.fn(),
}));

vi.mock("ai", () => ({
  embed: (...args: unknown[]) => mocks.embed(...args),
}));

vi.mock("@/server/llm/provider", () => ({
  getOpenAI: () => ({ embedding: (model: string) => ({ model }) }),
  getOpenAIMaxRetries: () => 0,
}));

vi.mock("@/server/supabase/client", () => ({
  getSupabase: () => ({
    rpc: (...args: unknown[]) => mocks.rpc(...args),
    from: (...args: unknown[]) => mocks.from(...args),
  }),
}));

import { retrieve } from "@/server/rag/retriever";

const VECTOR_ROW = {
  id: "general-case",
  dataset: "general",
  source_row: 1,
  legal_category: "주택임대차",
  issue: "보증금 반환 소송",
  service_fit: "direct",
  question: "보증금 반환 소송은 어떻게 하나요?",
  answer: "일반 안내",
  answer_status: "complete",
  decision_reason: null,
  score: 0.82,
};

const TRIGGER_ROW = {
  id: "hug-casebook-trigger-05-litigation-support-status",
  dataset: "hug-jeonse-damage-question-triggers-2025",
  source_row: 5,
  legal_category: "전세피해 특이사례 질문",
  issue: "보증금반환소송 비용 부담",
  service_fit: "conditional",
  question: "전세사기피해자 결정이나 HUG 전세피해확인서를 받은 상태인가요?",
  answer: null,
  answer_status: "missing",
  decision_reason: "공적 지원 신청 경로 확인",
  statutes: null,
  source_metadata: {
    record_type: "question_trigger",
    allowed_use: "conditional",
    applicability_gate: ["considering_litigation"],
    user_signal: ["변호사 비용을 감당하기 어렵다"],
    target_fact: "전세사기피해자 결정 또는 피해확인서 발급 상태",
    why_material: "공적 법률지원 신청 경로를 확인하는 데 필요하다.",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.embed.mockResolvedValue({ embedding: [0.1, 0.2] });
  mocks.rpc.mockResolvedValue({ data: [VECTOR_ROW], error: null });
  mocks.in.mockResolvedValue({
    data: [{ id: VECTOR_ROW.id, statutes: null, source_metadata: {} }],
    error: null,
  });
  mocks.contains.mockResolvedValue({ data: [TRIGGER_ROW], error: null });
  mocks.from.mockReturnValue({ select: mocks.select });
  mocks.select.mockImplementation((columns: string) =>
    columns === "id,statutes,source_metadata"
      ? { in: mocks.in }
      : { contains: mocks.contains }
  );
});

describe("Supabase RAG 질문 트리거 합산", () => {
  it("벡터 Top-k에 없어도 모든 gate가 맞는 질문 트리거를 결과에 합친다", async () => {
    const results = await retrieve(
      "보증금 반환 소송을 고민 중인데 변호사 비용이 부담되고 법률구조 지원을 받고 싶어요.",
      16,
    );

    expect(results.map((item) => item.id)).toEqual([
      VECTOR_ROW.id,
      TRIGGER_ROW.id,
    ]);
    expect(results[1]).toMatchObject({
      recordType: "question_trigger",
      score: 0,
      applicabilityGate: ["considering_litigation"],
      matchedGates: ["considering_litigation"],
      targetFact: TRIGGER_ROW.source_metadata.target_fact,
    });
    expect(mocks.contains).toHaveBeenCalledWith("source_metadata", {
      record_type: "question_trigger",
      allowed_use: "conditional",
    });
  });

  it("일부 gate만 맞는 트리거는 별도 조회돼도 합치지 않는다", async () => {
    mocks.contains.mockResolvedValue({
      data: [{
        ...TRIGGER_ROW,
        id: "two-gate-trigger",
        source_metadata: {
          ...TRIGGER_ROW.source_metadata,
          applicability_gate: ["considering_litigation", "victim_decision_pending"],
        },
      }],
      error: null,
    });

    const results = await retrieve("변호사 비용이 부담됩니다.", 16);

    expect(results.map((item) => item.id)).toEqual([VECTOR_ROW.id]);
  });

  it("감지된 gate가 없으면 질문 트리거 전체 조회를 생략한다", async () => {
    const results = await retrieve("임대차 계약서를 가지고 있습니다.", 16);

    expect(results.map((item) => item.id)).toEqual([VECTOR_ROW.id]);
    expect(mocks.contains).not.toHaveBeenCalled();
  });
});
