// 턴 진행 — gh/multiturn-design의 orchestrator/turnRunner.ts에서 이전.
// history 배열에 사용자·AI 발화를 순서대로 추가하고 LLM에 위임한다.
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
  history.push({ role: "user", content: userMessage });

  const output = await runTurn(model, history);

  history.push({ role: "assistant", content: output.reply });

  return {
    reply: output.reply,
    phase: output.phase,
    collected: output.collected,
  };
}
