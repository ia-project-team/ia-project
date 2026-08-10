// 필터링된 대한법률구조공단 Excel 사례를 정규화·임베딩해 Supabase에 동기화한다.
// 실행:
//   npm run rag:inspect -- <1차.xlsm> <2차.xlsm>
//   npm run rag:sync -- <1차.xlsm> <2차.xlsm>
import path from "node:path";

import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";
import { embedMany } from "ai";

import {
  EMBEDDING_DIM,
  EMBEDDING_MODEL,
  type RagAnswerStatus,
  type RagServiceFit,
} from "../src/core/rag/types";

const TARGET_SHEETS = ["(필터링)사례", "조건부검토"] as const;
const EMBEDDING_BATCH_SIZE = 64;
const UPSERT_BATCH_SIZE = 50;

type NormalizedCase = {
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
  source_metadata: {
    source_file: string;
    source_sheet: string;
    workbook_row: number;
  };
};

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).normalize("NFC").replace(/\r\n/g, "\n").trim();
}

function normalizeHeader(value: unknown): string {
  return normalizeText(value).replace(/\s+/g, "");
}

function datasetName(filePath: string): string {
  const name = path.basename(filePath).normalize("NFC");
  if (name.includes("1차")) return "klac-round-1";
  if (name.includes("2차")) return "klac-round-2";
  throw new Error(`${name}: 파일명에서 1차/2차 데이터셋을 구분할 수 없습니다.`);
}

function integerCell(value: unknown, context: string): number {
  const parsed = Number(normalizeText(value));
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${context}: 올바른 원본 행 번호가 아닙니다 (${String(value)}).`);
  }
  return parsed;
}

function headerMap(sheet: ExcelJS.Worksheet): Map<string, number> {
  const result = new Map<string, number>();
  sheet.getRow(1).eachCell({ includeEmpty: false }, (cell, column) => {
    result.set(normalizeHeader(cell.text), column);
  });
  return result;
}

function requiredColumn(
  headers: Map<string, number>,
  name: string,
  context: string,
): number {
  const column = headers.get(normalizeHeader(name));
  if (!column) throw new Error(`${context}: '${name}' 컬럼이 없습니다.`);
  return column;
}

function optionalCell(
  row: ExcelJS.Row,
  headers: Map<string, number>,
  name: string,
): string | null {
  const column = headers.get(normalizeHeader(name));
  if (!column) return null;
  return normalizeText(row.getCell(column).text) || null;
}

function readSheet(
  sheet: ExcelJS.Worksheet,
  dataset: string,
  sourceFile: string,
): NormalizedCase[] {
  const context = `${sourceFile} / ${sheet.name}`;
  const headers = headerMap(sheet);
  const categoryColumn = requiredColumn(headers, "법률분류", context);
  const questionColumn = requiredColumn(headers, "유사질문", context);
  const answerColumn = requiredColumn(headers, "유사답변", context);
  const fitColumn = requiredColumn(headers, "서비스_적합도", context);

  // 직접 포함 시트는 두 번째 NO 컬럼, 조건부 시트는 첫 번째 NO 컬럼이 원본 행이다.
  const sourceRowColumn =
    headers.get(normalizeHeader("NO\n(원본)")) ??
    requiredColumn(headers, "NO", context);

  const cases: NormalizedCase[] = [];
  sheet.eachRow({ includeEmpty: false }, (row, workbookRow) => {
    if (workbookRow === 1) return;

    const question = normalizeText(row.getCell(questionColumn).text);
    if (!question) return;

    const legalCategory = normalizeText(row.getCell(categoryColumn).text);
    if (!legalCategory) {
      throw new Error(`${context} ${workbookRow}행: 법률분류가 없습니다.`);
    }

    const fitLabel = normalizeText(row.getCell(fitColumn).text);
    const serviceFit: RagServiceFit = fitLabel === "직접 포함"
      ? "direct"
      : fitLabel === "조건부 검토"
        ? "conditional"
        : (() => {
            throw new Error(`${context} ${workbookRow}행: 알 수 없는 서비스 적합도 '${fitLabel}'`);
          })();

    const sourceRow = integerCell(
      row.getCell(sourceRowColumn).text,
      `${context} ${workbookRow}행`,
    );
    const answer = normalizeText(row.getCell(answerColumn).text) || null;

    cases.push({
      id: `${dataset}-row-${sourceRow}`,
      dataset,
      source_row: sourceRow,
      legal_category: legalCategory,
      issue: optionalCell(row, headers, "핵심쟁점"),
      service_fit: serviceFit,
      question,
      answer,
      statutes: optionalCell(row, headers, "주요법령"),
      precedents: optionalCell(row, headers, "판례"),
      decision_reason: optionalCell(row, headers, "판정근거"),
      answer_status: answer ? "complete" : "missing",
      source_metadata: {
        source_file: sourceFile,
        source_sheet: sheet.name.normalize("NFC"),
        workbook_row: workbookRow,
      },
    });
  });

  return cases;
}

export async function loadCases(filePaths: string[]): Promise<NormalizedCase[]> {
  if (filePaths.length === 0) {
    throw new Error("필터링된 1차·2차 .xlsm 파일 경로를 인자로 전달하세요.");
  }

  const allCases: NormalizedCase[] = [];
  for (const filePath of filePaths) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const dataset = datasetName(filePath);
    const sourceFile = path.basename(filePath).normalize("NFC");

    for (const sheetName of TARGET_SHEETS) {
      const sheet = workbook.getWorksheet(sheetName);
      if (!sheet) throw new Error(`${sourceFile}: '${sheetName}' 시트가 없습니다.`);
      allCases.push(...readSheet(sheet, dataset, sourceFile));
    }
  }

  const ids = new Set<string>();
  for (const caseItem of allCases) {
    if (ids.has(caseItem.id)) throw new Error(`중복 사례 ID: ${caseItem.id}`);
    ids.add(caseItem.id);
  }

  return allCases.sort((a, b) =>
    a.dataset.localeCompare(b.dataset) || a.source_row - b.source_row,
  );
}

function embeddingInput(caseItem: NormalizedCase): string {
  return [
    caseItem.issue ? `핵심쟁점: ${caseItem.issue}` : null,
    `법률분류: ${caseItem.legal_category}`,
    `사례질문: ${caseItem.question}`,
  ].filter((line): line is string => line !== null).join("\n");
}

function printSummary(cases: NormalizedCase[]): void {
  const count = (predicate: (caseItem: NormalizedCase) => boolean) =>
    cases.filter(predicate).length;
  const byDataset = new Map<string, NormalizedCase[]>();
  for (const caseItem of cases) {
    const rows = byDataset.get(caseItem.dataset) ?? [];
    rows.push(caseItem);
    byDataset.set(caseItem.dataset, rows);
  }

  console.log(`총 ${cases.length}개 사례`);
  for (const [dataset, rows] of byDataset) {
    console.log(
      `- ${dataset}: ${rows.length}개 ` +
      `(직접 ${count((c) => c.dataset === dataset && c.service_fit === "direct")}, ` +
      `조건부 ${count((c) => c.dataset === dataset && c.service_fit === "conditional")}, ` +
      `답변 없음 ${count((c) => c.dataset === dataset && c.answer_status === "missing")})`,
    );
  }
  console.log("샘플:", {
    id: cases[0]?.id,
    issue: cases[0]?.issue,
    question: cases[0]?.question.slice(0, 100),
  });
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const filePaths = args.filter((arg) => arg !== "--dry-run");
  const cases = await loadCases(filePaths);
  printSummary(cases);
  if (dryRun) return;

  const { OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  }

  const openai = createOpenAI({ apiKey: OPENAI_API_KEY });
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const rows: Array<NormalizedCase & { embedding: number[] }> = [];
  for (let start = 0; start < cases.length; start += EMBEDDING_BATCH_SIZE) {
    const batch = cases.slice(start, start + EMBEDDING_BATCH_SIZE);
    const { embeddings } = await embedMany({
      model: openai.textEmbedding(EMBEDDING_MODEL),
      values: batch.map(embeddingInput),
    });
    if (embeddings.some((embedding) => embedding.length !== EMBEDDING_DIM)) {
      throw new Error(`임베딩 차원이 ${EMBEDDING_DIM}이 아닙니다.`);
    }
    rows.push(...batch.map((caseItem, index) => ({
      ...caseItem,
      embedding: embeddings[index],
    })));
  }

  for (let start = 0; start < rows.length; start += UPSERT_BATCH_SIZE) {
    const { error } = await supabase
      .from("rag_cases")
      .upsert(rows.slice(start, start + UPSERT_BATCH_SIZE));
    if (error) throw new Error(`upsert 실패: ${error.message}`);
  }

  const currentIds = new Set(rows.map((row) => row.id));
  const { data: existing, error: listError } = await supabase
    .from("rag_cases")
    .select("id");
  if (listError) throw new Error(`기존 사례 조회 실패: ${listError.message}`);

  const staleIds = (existing ?? [])
    .map((row) => row.id as string)
    .filter((id) => !currentIds.has(id));
  for (let start = 0; start < staleIds.length; start += UPSERT_BATCH_SIZE) {
    const { error } = await supabase
      .from("rag_cases")
      .delete()
      .in("id", staleIds.slice(start, start + UPSERT_BATCH_SIZE));
    if (error) throw new Error(`stale 사례 삭제 실패: ${error.message}`);
  }

  console.log(`${rows.length}개 사례 동기화 완료, stale ${staleIds.length}개 삭제`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
