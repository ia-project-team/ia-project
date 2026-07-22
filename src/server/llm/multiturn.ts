// 멀티턴 한 턴 처리 — Vercel AI SDK 사용.
//
// OPENAI_BASE_URL 설정 시(프록시): generateText + 수동 JSON 파싱
// 미설정(공식 OpenAI): generateObject (JSON 스키마 강제)
import "server-only";

import { generateObject, generateText } from "ai";

import { MULTITURN_SYSTEM_PROMPT } from "@/core/checklist/prompts";
import type { RetrievedChunk } from "@/core/rag/types";
import {
  TurnOutputSchema,
  type ConversationMessage,
  type TurnOutput,
} from "@/core/schemas/turn";
import { getOpenAI } from "./provider";

function formatRagContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";

  const references = chunks
    .map(
      (chunk, index) =>
        [
          `<reference index="${index + 1}" topic="${chunk.topic}">`,
          chunk.content,
          "</reference>",
        ].join("\n"),
    )
    .join("\n\n");

  return `

# 검색된 참고 자료

${references}

# 참고 자료 사용 규칙

1. 참고 자료가 현재 사용자 발화와 실질적으로 관련 있는지 먼저 판단하세요.

2. 관련 있는 참고 자료가 있다면, 일반 체크리스트의 다음 항목보다
   참고 자료에서 제시한 중요 사실을 확인하는 질문을 우선하세요.

3. 참고 자료의 "확인해야 할 질문" 가운데 현재 대화에서 아직 확인되지 않은
   가장 중요한 내용 하나를 골라 질문하세요.

4. 참고 자료에 필요한 사실을 확인한 뒤 기존 체크리스트 수집으로 돌아가세요.

5. 참고 자료의 내용을 사용자가 진술한 사실로 간주하지 마세요.

6. collected에는 사용자가 직접 말하거나 명확히 확인한 사실만 기록하세요.

7. 참고 자료가 현재 사용자 상황과 관련 없으면 무시하고
   기존 체크리스트 수집을 계속하세요.

8. 참고 자료만으로 사용자 사건의 결론을 단정하지 마세요.`;
}

/** 대화 기록 전체를 넘겨 한 턴을 처리한다. */
export async function runTurn(
  model: string,
  history: ConversationMessage[],
  ragChunks: RetrievedChunk[] = [],
): Promise<TurnOutput> {
  const openai = getOpenAI();
  const systemPrompt =
    MULTITURN_SYSTEM_PROMPT + formatRagContext(ragChunks);

  if (process.env.OPENAI_BASE_URL) {
    const { text } = await generateText({
      model: openai.chat(model),
      system:
        systemPrompt +
        "\n\n반드시 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.",
      messages: history,
    });

    const json = JSON.parse(text.trim()) as unknown;
    return TurnOutputSchema.parse(json);
  }

  const { object } = await generateObject({
    model: openai(model),
    schema: TurnOutputSchema,
    system: systemPrompt,
    messages: history,
  });

  return object;
}
