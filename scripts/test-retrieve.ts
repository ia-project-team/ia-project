// 검색 품질을 CLI에서 확인하는 도구.
// 실행: npx tsx --env-file=.env.local scripts/test-retrieve.ts "검색할 발화"
import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { embed } from "ai";

async function main() {
  const query = process.argv[2];
  if (!query) throw new Error('사용법: test-retrieve.ts "검색할 발화"');

  const { OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("환경변수가 없습니다. --env-file=.env.local 로 실행하세요.");
  }

  const openai = createOpenAI({ apiKey: OPENAI_API_KEY });
  const { embedding } = await embed({
    model: openai.textEmbedding("text-embedding-3-small"),
    value: query,
  });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.rpc("match_rag_documents", {
    query_embedding: embedding,
    match_count: 3,
  });
  if (error) throw new Error(error.message);

  for (const r of data as { topic: string; score: number }[]) {
    console.log(`[${r.score.toFixed(3)}] ${r.topic}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});