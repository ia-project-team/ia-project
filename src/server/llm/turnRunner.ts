// 턴 진행 — gh/multiturn-design의 orchestrator/turnRunner.ts에서 이전.
// LLM 호출이 성공한 턴만 history에 반영한다 (실패 시 세션 무변경).
// 서버는 AI의 phase 판단을 신뢰한다 (거부권 없음).
import "server-only";

import { runTurn } from "./multiturn";
import type { ConversationMessage, TurnOutput } from "@/core/schemas/turn";

export interface TurnResult {
  reply: string;
  phase: TurnOutput["phase"];
  collected: TurnOutput["collected"];
}

export async function runSingleTurn(
  userMessage: string,
  history: ConversationMessage[],
  model: string,
): Promise<TurnResult> {
  const output = await runTurn(model, [
    ...history,
    { role: "user", content: userMessage },
  ]);

  // LLM 호출이 성공한 경우에만 세션 history에 반영한다.
  history.push({ role: "user", content: userMessage });
  history.push({ role: "assistant", content: output.reply });

  return {
    reply: output.reply,
    phase: output.phase,
    collected: output.collected,
  };
}
