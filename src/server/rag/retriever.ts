// RAG 검색기 — server-only.
// 쿼리를 임베딩하고, 유사도 검색은 Supabase(pgvector)에 위임한다.
import "server-only";

import { embed } from "ai";

import type { RetrievedChunk } from "@/core/rag/types";
import { getOpenAI } from "@/server/llm/provider";
import { getSupabase } from "@/server/supabase/client";

const EMBEDDING_MODEL = "text-embedding-3-small";

/** 사용자 발화·정황을 받아 관련 가이드 문서 상위 k개를 반환한다. */
export async function retrieve(query: string, k = 3): Promise<RetrievedChunk[]> {
  const { embedding } = await embed({
    model: getOpenAI().textEmbedding(EMBEDDING_MODEL),
    value: query,
  });

  const { data, error } = await getSupabase().rpc("match_rag_documents", {
    query_embedding: embedding,
    match_count: k,
  });
  if (error) throw new Error(`RAG 검색 실패: ${error.message}`);

  return (data ?? []) as RetrievedChunk[];
}