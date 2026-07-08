// corpus/*.md를 임베딩해 Supabase rag_documents 테이블에 upsert한다.
// Next.js 밖에서 실행되므로 server-only 모듈을 쓰지 않는다.
// 실행: npm run rag:sync
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { embedMany } from "ai";

import { EMBEDDING_DIM, EMBEDDING_MODEL } from "../src/core/rag/types";

const CORPUS_DIR = "src/server/rag/corpus";

/** frontmatter(---로 감싼 메타)와 본문을 분리한다. */
function parseDoc(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error("frontmatter가 없습니다 (---로 시작해야 함)");
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body: m[2].trim() };
}

async function main() {
  const { OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  }
  const openai = createOpenAI({ apiKey: OPENAI_API_KEY });
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const files = (await readdir(CORPUS_DIR)).filter((f) => f.endsWith(".md"));
  if (files.length === 0) throw new Error(`${CORPUS_DIR}에 문서가 없습니다.`);

  const docs = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(CORPUS_DIR, file), "utf8");
      const { meta, body } = parseDoc(raw);
      if (!meta.topic) throw new Error(`${file}: frontmatter에 topic이 없습니다.`);
      return {
        id: file.replace(/\.md$/, ""),
        topic: meta.topic,
        keywords: (meta.keywords ?? "").split(",").map((s) => s.trim()).filter(Boolean),
        content: body,
      };
    }),
  );

  // topic·keywords를 본문과 함께 임베딩해 짧은 발화도 잘 걸리게 한다.
  const { embeddings } = await embedMany({
    model: openai.textEmbedding(EMBEDDING_MODEL),
    values: docs.map((d) => `${d.topic}\n${d.keywords.join(", ")}\n${d.content}`),
  });

  const rows = docs.map((d, i) => ({ ...d, embedding: embeddings[i] }));
  const { error } = await supabase.from("rag_documents").upsert(rows);
  if (error) throw new Error(`upsert 실패: ${error.message}`);

  console.log(`${rows.length}개 문서 동기화 완료`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});