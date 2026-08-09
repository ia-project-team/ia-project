// RAG 검색기 — server-only.
// 쿼리를 임베딩하고, 유사도 검색은 Supabase(pgvector)에 위임한다.
import "server-only";

import { embed } from "ai";

import { EMBEDDING_MODEL, type RetrievedCase } from "@/core/rag/types";
import { getOpenAI } from "@/server/llm/provider";
import { getSupabase } from "@/server/supabase/client";

type RagCaseRow = {
  id: string;
  dataset: string;
  source_row: number;
  legal_category: string;
  issue: string | null;
  service_fit: RetrievedCase["serviceFit"];
  question: string;
  answer: string | null;
  answer_status: RetrievedCase["answerStatus"];
  decision_reason: string | null;
  score: number;
};

/** 사용자 발화·정황을 받아 관련 실제 상담사례 상위 k개를 반환한다. */
export async function retrieve(query: string, k = 8): Promise<RetrievedCase[]> {
  const { embedding } = await embed({
    model: getOpenAI().textEmbedding(EMBEDDING_MODEL),
    value: query,
  });

  const { data, error } = await getSupabase().rpc("match_rag_cases", {
    query_embedding: embedding,
    match_count: k,
  });
  if (error) throw new Error(`RAG 검색 실패: ${error.message}`);

  return ((data ?? []) as RagCaseRow[]).map((row) => ({
    id: row.id,
    dataset: row.dataset,
    sourceRow: row.source_row,
    legalCategory: row.legal_category,
    issue: row.issue,
    serviceFit: row.service_fit,
    question: row.question,
    answer: row.answer,
    answerStatus: row.answer_status,
    decisionReason: row.decision_reason,
    score: row.score,
  }));
}
