// 새 JSONL 운영 후보 또는 명시적으로 선택한 질문 트리거를 Supabase에 비파괴 동기화한다.
// 기본 실행은 드라이런이며 --apply를 전달해야만 외부 API와 DB를 사용한다.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { embedMany } from "ai";

import { buildRetrievalText } from "../src/core/rag/retrievalText";
import {
  EMBEDDING_DIM,
  EMBEDDING_MODEL,
  type RagAnswerStatus,
  type RagServiceFit,
} from "../src/core/rag/types";

const DEFAULT_CORPUS_PATH = path.join(
  process.cwd(),
  "data",
  "rag",
  "deduplicated",
  "production_candidates.jsonl",
);
const QUESTION_TRIGGER_PATH = path.join(
  process.cwd(),
  "data",
  "rag",
  "deduplicated",
  "question_triggers.jsonl",
);
const EMBEDDING_BATCH_SIZE = 64;
const UPSERT_BATCH_SIZE = 50;

type CorpusTarget = "production" | "question_triggers";

export type ProductionJsonlRecord = {
  record_id: string;
  dataset: string;
  source_row: number;
  legal_category: string;
  issue: string | null;
  service_fit: RagServiceFit;
  question: string;
  answer: string | null;
  answer_status: RagAnswerStatus;
  decision_reason: string | null;
  allowed_use: string;
  rights_status: string;
  record_type: string;
  applicability_gate: string[];
  user_signal: string[];
  target_fact: string | null;
  why_material: string | null;
  statutes: string[];
  precedents: string[];
  source_org: string;
  source_title: string;
  source_url: string;
  source_date: string | null;
  retrieved_at: string;
  license_type: string;
  source_metadata: Record<string, unknown>;
};

type RagCaseUpsert = {
  id: string;
  dataset: string;
  source_row: number;
  legal_category: string;
  issue: string | null;
  service_fit: RagServiceFit;
  question: string;
  answer: string | null;
  statutes: string | null;
  precedents: string | null;
  decision_reason: string | null;
  answer_status: RagAnswerStatus;
  source_metadata: Record<string, unknown>;
  embedding: number[];
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function validateRecord(
  value: unknown,
  lineNumber: number,
  target: CorpusTarget,
): ProductionJsonlRecord {
  if (!value || typeof value !== "object") {
    throw new Error(`${lineNumber}행: JSON 객체가 아닙니다.`);
  }
  const row = value as Partial<ProductionJsonlRecord>;
  const context = `${lineNumber}행 ${row.record_id ?? "ID 없음"}`;
  if (
    typeof row.record_id !== "string" || !row.record_id ||
    typeof row.dataset !== "string" || !row.dataset ||
    !Number.isInteger(row.source_row) || Number(row.source_row) <= 0 ||
    typeof row.legal_category !== "string" || !row.legal_category ||
    !["direct", "conditional"].includes(row.service_fit ?? "") ||
    typeof row.question !== "string" || !row.question ||
    !["complete", "missing"].includes(row.answer_status ?? "") ||
    typeof row.record_type !== "string" || !row.record_type ||
    !isStringArray(row.applicability_gate) ||
    !isStringArray(row.user_signal) ||
    !isStringArray(row.statutes) ||
    !isStringArray(row.precedents) ||
    typeof row.source_org !== "string" ||
    typeof row.source_title !== "string" ||
    typeof row.source_url !== "string" ||
    typeof row.license_type !== "string" ||
    !row.source_metadata || typeof row.source_metadata !== "object"
  ) {
    throw new Error(`${context}: 필수 필드 형식이 올바르지 않습니다.`);
  }
  if (target === "production") {
    if (row.allowed_use !== "production_candidate") {
      throw new Error(`${context}: production_candidate가 아닌 레코드는 업로드할 수 없습니다.`);
    }
    if (row.rights_status !== "confirmed_public_use_with_attribution") {
      throw new Error(`${context}: 권리 확인이 끝나지 않은 레코드는 업로드할 수 없습니다.`);
    }
    if (row.answer_status !== "complete" || typeof row.answer !== "string" || !row.answer) {
      throw new Error(`${context}: 운영 후보는 완성된 답변이 필요합니다.`);
    }
  } else {
    if (
      row.allowed_use !== "conditional" ||
      row.rights_status !== "review_required" ||
      row.record_type !== "question_trigger" ||
      row.service_fit !== "conditional" ||
      row.answer_status !== "missing" ||
      row.answer !== null ||
      row.applicability_gate.length === 0 ||
      row.user_signal.length === 0 ||
      typeof row.target_fact !== "string" || !row.target_fact ||
      typeof row.why_material !== "string" || !row.why_material
    ) {
      throw new Error(`${context}: 조건부 질문 트리거 형식이 올바르지 않습니다.`);
    }
  }
  return row as ProductionJsonlRecord;
}

async function loadJsonl(
  filePath: string,
  target: CorpusTarget,
): Promise<ProductionJsonlRecord[]> {
  const text = await readFile(filePath, "utf8");
  const rows = text
    .split(/\r?\n/u)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line.length > 0)
    .map(({ line, lineNumber }) => {
      try {
        return validateRecord(JSON.parse(line) as unknown, lineNumber, target);
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error(`${lineNumber}행: JSON 파싱 실패 (${error.message})`);
        }
        throw error;
      }
    });

  const ids = new Set<string>();
  const datasetRows = new Set<string>();
  const content = new Set<string>();
  for (const row of rows) {
    const datasetRow = `${row.dataset}:${row.source_row}`;
    const contentKey = `${row.question.normalize("NFC").trim()}\u0000${row.answer?.normalize("NFC").trim()}`;
    if (ids.has(row.record_id)) throw new Error(`중복 레코드 ID: ${row.record_id}`);
    if (datasetRows.has(datasetRow)) throw new Error(`중복 dataset/source_row: ${datasetRow}`);
    if (content.has(contentKey)) throw new Error(`중복 질문·답변: ${row.record_id}`);
    ids.add(row.record_id);
    datasetRows.add(datasetRow);
    content.add(contentKey);
  }
  return rows.toSorted((left, right) =>
    left.dataset.localeCompare(right.dataset) || left.source_row - right.source_row
  );
}

export async function loadProductionJsonl(
  filePath = DEFAULT_CORPUS_PATH,
): Promise<ProductionJsonlRecord[]> {
  return loadJsonl(filePath, "production");
}

export async function loadQuestionTriggersJsonl(
  filePath = QUESTION_TRIGGER_PATH,
): Promise<ProductionJsonlRecord[]> {
  return loadJsonl(filePath, "question_triggers");
}

export function embeddingInput(row: ProductionJsonlRecord): string {
  return buildRetrievalText({
    legalCategory: row.legal_category,
    issue: row.issue,
    question: row.question,
    answer: row.answer,
    recordType: row.record_type,
    applicabilityGate: row.applicability_gate,
    userSignals: row.user_signal,
    ...(row.target_fact ? { targetFact: row.target_fact } : {}),
    ...(row.why_material ? { whyMaterial: row.why_material } : {}),
    statutes: row.statutes,
  });
}

export function toUpsertRow(
  row: ProductionJsonlRecord,
  embedding: number[],
): RagCaseUpsert {
  return {
    id: row.record_id,
    dataset: row.dataset,
    source_row: row.source_row,
    legal_category: row.legal_category,
    issue: row.issue,
    service_fit: row.service_fit,
    question: row.question,
    answer: row.answer,
    statutes: row.statutes.length > 0 ? row.statutes.join("\n") : null,
    precedents: row.precedents.length > 0 ? row.precedents.join("\n") : null,
    decision_reason: row.decision_reason,
    answer_status: row.answer_status,
    source_metadata: {
      ...row.source_metadata,
      source_org: row.source_org,
      source_title: row.source_title,
      source_url: row.source_url,
      source_date: row.source_date,
      retrieved_at: row.retrieved_at,
      license_type: row.license_type,
      rights_status: row.rights_status,
      allowed_use: row.allowed_use,
      record_type: row.record_type,
      applicability_gate: row.applicability_gate,
      user_signal: row.user_signal,
      target_fact: row.target_fact,
      why_material: row.why_material,
    },
    embedding,
  };
}

function printSummary(rows: ProductionJsonlRecord[]): void {
  const grouped = Object.groupBy(rows, (row) => row.dataset);
  const retrievalCharacters = rows.reduce(
    (total, row) => total + embeddingInput(row).length,
    0,
  );
  console.log(`업로드 후보 ${rows.length}건 (기존 행 삭제 없음)`);
  for (const [dataset, items] of Object.entries(grouped)) {
    console.log(`- ${dataset}: ${items?.length ?? 0}건`);
  }
  console.log(`임베딩 입력 문자 수: ${retrievalCharacters}`);
}

async function applySync(rows: ProductionJsonlRecord[]): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiKey || !supabaseUrl || !serviceRoleKey) {
    throw new Error("OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  }

  const openai = createOpenAI({ apiKey });
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const embeddings: number[][] = [];
  let embeddingTokens = 0;
  for (let start = 0; start < rows.length; start += EMBEDDING_BATCH_SIZE) {
    const batch = rows.slice(start, start + EMBEDDING_BATCH_SIZE);
    const result = await embedMany({
      model: openai.embedding(EMBEDDING_MODEL),
      values: batch.map(embeddingInput),
    });
    if (result.embeddings.some((embedding) => embedding.length !== EMBEDDING_DIM)) {
      throw new Error(`임베딩 차원이 ${EMBEDDING_DIM}이 아닙니다.`);
    }
    embeddingTokens += result.usage.tokens;
    embeddings.push(...result.embeddings);
    console.log(`임베딩 ${Math.min(start + batch.length, rows.length)}/${rows.length}`);
  }
  if (embeddings.length !== rows.length) {
    throw new Error("임베딩 개수와 레코드 개수가 다릅니다.");
  }

  const upserts = rows.map((row, index) => toUpsertRow(row, embeddings[index]));
  for (let start = 0; start < upserts.length; start += UPSERT_BATCH_SIZE) {
    const batch = upserts.slice(start, start + UPSERT_BATCH_SIZE);
    const { error } = await supabase
      .from("rag_cases")
      .upsert(batch, { onConflict: "id" });
    if (error) throw new Error(`Supabase upsert 실패: ${error.message}`);
    console.log(`업로드 ${Math.min(start + batch.length, upserts.length)}/${upserts.length}`);
  }

  const expectedIds = new Set(rows.map((row) => row.record_id));
  const datasets = [...new Set(rows.map((row) => row.dataset))];
  const { data, error } = await supabase
    .from("rag_cases")
    .select("id,dataset")
    .in("dataset", datasets)
    .range(0, 999);
  if (error) throw new Error(`업로드 검증 조회 실패: ${error.message}`);
  const uploadedIds = new Set((data ?? []).map((row) => row.id as string));
  const missingIds = [...expectedIds].filter((id) => !uploadedIds.has(id));
  if (missingIds.length > 0) {
    throw new Error(`업로드 후 누락 ${missingIds.length}건: ${missingIds.slice(0, 3).join(", ")}`);
  }
  console.log(
    `동기화 완료: ${rows.length}건, 임베딩 토큰 ${embeddingTokens}, 기존 행 삭제 0건`,
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const onlyTriggers = args.includes("--only-triggers");
  const rows = onlyTriggers
    ? await loadQuestionTriggersJsonl()
    : await loadProductionJsonl();
  printSummary(rows);
  if (!apply) {
    console.log("드라이런 완료. 외부 API와 Supabase를 호출하지 않았습니다.");
    return;
  }
  await applySync(rows);
}

const entryPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;
if (entryPath === import.meta.url) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
