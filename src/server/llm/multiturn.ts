// 멀티턴 한 턴 처리 — Vercel AI SDK 사용.
//
// OPENAI_BASE_URL 설정 시(프록시): generateText + 수동 JSON 파싱
// 미설정(공식 OpenAI): generateObject (JSON 스키마 강제)
import "server-only";

import { generateObject, generateText } from "ai";

import { TurnOutputSchema, type TurnOutput, type ConversationMessage } from "@/core/schemas/turn";
import { MULTITURN_SYSTEM_PROMPT } from "@/core/checklist/prompts";
import { getOpenAI } from "./provider";

/** 대화 기록 전체를 넘겨 한 턴을 처리한다. */
export async function runTurn(
  model: string,
  history: ConversationMessage[],
): Promise<TurnOutput> {
  const openai = getOpenAI();

  if (process.env.OPENAI_BASE_URL) {
    const { text } = await generateText({
      model: openai.chat(model),
      system: MULTITURN_SYSTEM_PROMPT + "\n\n반드시 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.",
      messages: history,
    });

    const json = JSON.parse(text.trim()) as unknown;
    return TurnOutputSchema.parse(json);
  }

  const { object } = await generateObject({
    model: openai(model),
    schema: TurnOutputSchema,
    system: MULTITURN_SYSTEM_PROMPT,
    messages: history,
  });

  return object;
}
