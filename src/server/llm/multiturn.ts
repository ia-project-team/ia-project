// 멀티턴 한 턴 처리 — Vercel AI SDK (generateObject) 사용.
//
// [SDK 변환 요약]
// Before (OpenAI SDK):
//   client.responses.parse({ model, instructions, input: history, store: false,
//     text: { format: zodTextFormat(TurnOutput, "turn_output") } })
// After (Vercel AI SDK):
//   generateObject({ model: openai(model), schema: TurnOutputSchema,
//     system: MULTITURN_SYSTEM_PROMPT, messages: history })
//
// - zodTextFormat  → schema (Zod 스키마를 generateObject에 직접 전달)
// - instructions   → system
// - input          → messages
// - store: false   → Vercel AI SDK는 기본적으로 저장하지 않음
// - output_parsed  → object (generateObject 반환값)
import "server-only";

import { generateObject } from "ai";

import { TurnOutputSchema, type TurnOutput, type ConversationMessage } from "@/core/schemas/turn";
import { MULTITURN_SYSTEM_PROMPT } from "@/core/checklist/prompts";
import { getOpenAI } from "./provider";

/** 대화 기록 전체를 넘겨 한 턴을 처리한다. */
export async function runTurn(
  model: string,
  history: ConversationMessage[],
): Promise<TurnOutput> {
  const openai = getOpenAI();

  const { object } = await generateObject({
    model: openai(model),
    schema: TurnOutputSchema,
    system: MULTITURN_SYSTEM_PROMPT,
    messages: history,
  });

  return object;
}
