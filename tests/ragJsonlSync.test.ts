import { describe, expect, it } from "vitest";

import {
  embeddingInput,
  loadProductionJsonl,
  loadQuestionTriggersJsonl,
  toUpsertRow,
} from "@/../scripts/sync-rag-jsonl";

describe("새 RAG JSONL Supabase 동기화", () => {
  it("권리 확인이 끝난 운영 후보 167건만 읽는다", async () => {
    const rows = await loadProductionJsonl();

    expect(rows).toHaveLength(167);
    expect(rows.every((row) => row.allowed_use === "production_candidate")).toBe(true);
    expect(
      rows.every((row) => row.rights_status === "confirmed_public_use_with_attribution"),
    ).toBe(true);
    expect(rows.some((row) => row.record_type === "question_trigger")).toBe(false);
  });

  it("별도 검토 대상으로 분리한 질문 트리거 22건만 읽는다", async () => {
    const rows = await loadQuestionTriggersJsonl();

    expect(rows).toHaveLength(22);
    expect(rows.every((row) => row.record_type === "question_trigger")).toBe(true);
    expect(rows.every((row) => row.allowed_use === "conditional")).toBe(true);
    expect(rows.every((row) => row.rights_status === "review_required")).toBe(true);
    expect(rows.every((row) => row.applicability_gate.length > 0)).toBe(true);
    expect(rows.every((row) => row.target_fact && row.why_material)).toBe(true);
  });

  it("검색용 텍스트에 쟁점·질문·답변 요지를 함께 포함한다", async () => {
    const [row] = await loadProductionJsonl();
    const text = embeddingInput(row);

    expect(text).toContain(`법률분류: ${row.legal_category}`);
    expect(text).toContain(`질문: ${row.question}`);
    expect(text).toContain("핵심내용:");
  });

  it("현재 rag_cases 스키마에 맞추고 출처·권리 메타데이터를 보존한다", async () => {
    const [row] = await loadProductionJsonl();
    const embedding = Array.from({ length: 1536 }, () => 0);
    const upsert = toUpsertRow(row, embedding);

    expect(upsert.id).toBe(row.record_id);
    expect(upsert.embedding).toHaveLength(1536);
    expect(upsert.source_metadata).toMatchObject({
      source_title: row.source_title,
      source_url: row.source_url,
      rights_status: "confirmed_public_use_with_attribution",
      allowed_use: "production_candidate",
    });
  });
});
