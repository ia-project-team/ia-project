// RAG 검색기 — server-only.
// 쿼리를 임베딩하고, 유사도 검색은 Supabase(pgvector)에 위임한다.
import "server-only";

import { embed } from "ai";

import { isQuestionTriggerApplicable } from "@/core/rag/retrievalPolicy";
import { detectApplicabilityGates } from "@/core/rag/retrievalText";
import { EMBEDDING_MODEL, type RetrievedCase } from "@/core/rag/types";
import { getOpenAI, getOpenAIMaxRetries } from "@/server/llm/provider";
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

type RagCaseMetadataRow = {
  id: string;
  statutes: string | null;
  source_metadata: unknown;
};

type StoredRagCaseRow = Omit<RagCaseRow, "score"> & RagCaseMetadataRow;

type RagSourceMetadata = {
  record_type?: unknown;
  allowed_use?: unknown;
  applicability_gate?: unknown;
  user_signal?: unknown;
  target_fact?: unknown;
  why_material?: unknown;
  source_title?: unknown;
  source_url?: unknown;
};

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function toRetrievedCase(
  row: RagCaseRow,
  metadataRow: RagCaseMetadataRow | undefined,
  queryGates: string[],
): RetrievedCase {
  const metadata = metadataRow?.source_metadata &&
      typeof metadataRow.source_metadata === "object"
    ? metadataRow.source_metadata as RagSourceMetadata
    : {};
  const applicabilityGate = stringArray(metadata.applicability_gate);
  const userSignals = stringArray(metadata.user_signal);
  const recordType = optionalString(metadata.record_type);
  const allowedUse = optionalString(metadata.allowed_use);
  const isQuestionTrigger = recordType === "question_trigger" &&
    allowedUse === "conditional";

  return {
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
    ...(recordType ? { recordType } : {}),
    ...(applicabilityGate.length > 0 ? { applicabilityGate } : {}),
    ...(userSignals.length > 0 ? { userSignals } : {}),
    ...(optionalString(metadata.target_fact)
      ? { targetFact: optionalString(metadata.target_fact) }
      : {}),
    ...(optionalString(metadata.why_material)
      ? { whyMaterial: optionalString(metadata.why_material) }
      : {}),
    ...(optionalString(metadata.source_title)
      ? { sourceTitle: optionalString(metadata.source_title) }
      : {}),
    ...(optionalString(metadata.source_url)
      ? { sourceUrl: optionalString(metadata.source_url) }
      : {}),
    ...(metadataRow?.statutes
      ? { statutes: metadataRow.statutes.split("\n").filter(Boolean) }
      : {}),
    ...(isQuestionTrigger
      ? {
          recordType: "question_trigger",
          matchedGates: applicabilityGate.filter((gate) => queryGates.includes(gate)),
        }
      : {}),
  } satisfies RetrievedCase;
}

async function fetchQuestionTriggerRows(
  supabase: ReturnType<typeof getSupabase>,
): Promise<StoredRagCaseRow[]> {
  const { data, error } = await supabase
    .from("rag_cases")
    .select("id,dataset,source_row,legal_category,issue,service_fit,question,answer,answer_status,decision_reason,statutes,source_metadata")
    .contains("source_metadata", {
      record_type: "question_trigger",
      allowed_use: "conditional",
    });
  if (error) {
    throw new Error(`RAG 질문 트리거 조회 실패: ${error.message}`);
  }
  return (data ?? []) as StoredRagCaseRow[];
}

/** 사용자 발화·정황을 받아 관련 실제 상담사례 상위 k개를 반환한다. */
export async function retrieve(query: string, k = 8): Promise<RetrievedCase[]> {
  const queryGates = detectApplicabilityGates(query);
  const { embedding } = await embed({
    model: getOpenAI().embedding(EMBEDDING_MODEL),
    value: query,
    maxRetries: getOpenAIMaxRetries(),
  });
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("match_rag_cases", {
    query_embedding: embedding,
    match_count: k,
  });
  if (error) throw new Error(`RAG 검색 실패: ${error.message}`);

  const rows = (data ?? []) as RagCaseRow[];
  const metadataById = new Map<string, RagCaseMetadataRow>();
  if (rows.length > 0) {
    const { data: metadataRows, error: metadataError } = await supabase
      .from("rag_cases")
      .select("id,statutes,source_metadata")
      .in("id", rows.map((row) => row.id));
    if (metadataError) {
      throw new Error(`RAG 메타데이터 조회 실패: ${metadataError.message}`);
    }
    for (const metadataRow of (metadataRows ?? []) as RagCaseMetadataRow[]) {
      metadataById.set(metadataRow.id, metadataRow);
    }
  }

  const vectorCases = rows.map((row) =>
    toRetrievedCase(row, metadataById.get(row.id), queryGates)
  );
  if (queryGates.length === 0) return vectorCases;

  // 질문 트리거 22건은 일반 사례와 벡터 Top-k 자리를 경쟁시키지 않는다.
  // 저장된 모든 트리거 중 현재 대화에서 모든 gate가 확인된 것만 별도로 합친다.
  const triggerRows = await fetchQuestionTriggerRows(supabase);
  const applicableTriggers = triggerRows
    .map((row) =>
      toRetrievedCase({ ...row, score: 0 }, row, queryGates)
    )
    .filter(isQuestionTriggerApplicable);

  const merged = new Map(vectorCases.map((caseItem) => [caseItem.id, caseItem]));
  for (const trigger of applicableTriggers) {
    const vectorMatch = merged.get(trigger.id);
    merged.set(
      trigger.id,
      vectorMatch ? { ...trigger, ...vectorMatch } : trigger,
    );
  }
  return [...merged.values()];
}
