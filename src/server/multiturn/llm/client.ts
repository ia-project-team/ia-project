// AI 턴 처리 — OpenAI Responses API에 위임 (c안).
//
// (b)안과 차이: (b)는 builder가 만든 "요약 문자열" 하나를 넘겼지만,
// (c)는 대화 기록(history) 전체를 메시지 배열로 넘긴다. AI가 맥락 전체를
// 보고 스스로 진행을 판단해야 하기 때문이다.
//
// 5/31 합의대로 Conversations API/previous_response_id를 쓰지 않고,
// 우리 서버가 보관한 history를 매 턴 통째로 전달한다(store: false).

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { TurnOutput } from "./schemas";
import { SYSTEM_PROMPT } from "./prompts";
import type { Message } from "../types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** 대화 기록 전체를 넘겨 한 턴을 처리한다. */
export async function runTurn(
  model: string,
  history: Message[],
): Promise<TurnOutput> {
  const response = await client.responses.parse({
    model,
    instructions: SYSTEM_PROMPT, // 역할 정의는 instructions로 분리
    input: history, // 대화 기록 전체를 그대로 전달
    store: false, // OpenAI 측 상태 저장 미사용 (우리가 관리)
    text: { format: zodTextFormat(TurnOutput, "turn_output") },
  });

  const parsed = response.output_parsed;
  if (!parsed) {
    throw new Error("AI 응답 파싱 실패: output_parsed가 비어 있음");
  }
  return parsed;
}
