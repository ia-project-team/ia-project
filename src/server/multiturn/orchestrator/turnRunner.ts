// 턴 진행 (c안).
//
// (b)안의 turnRunner에는 "종료 거부권"(AI가 done이라 해도 서버가 필수 항목
// 비었으면 막는) 통제가 있었다. (c)안에서는 그 통제를 의도적으로 제거했다.
// 진행과 완성 판단을 AI에게 온전히 맡기는 것이 (c)안의 선택이기 때문이다.
//
// 그 결과 이 파일은 매우 얇다: 기록에 사용자 발화를 넣고 → AI를 부르고 →
// AI 발화를 기록에 잇는다. 서버는 AI의 phase 판단을 그대로 신뢰한다.

import { runTurn } from "../llm/client";
import type { Message, Phase } from "../types";
import type { CollectedItem } from "../llm/schemas";

export interface TurnResult {
  reply: string;
  phase: Phase;
  collected: CollectedItem[];
}

export async function runSingleTurn(
  userMessage: string,
  history: Message[],
  model: string,
): Promise<TurnResult> {
  // 사용자 발화를 기록에 추가
  history.push({ role: "user", content: userMessage });

  // AI에 위임: 대화 기록 전체를 보고 진행·판정·완성까지 스스로 결정
  const output = await runTurn(model, history);

  // AI 발화를 기록에 이어 붙임 (다음 턴 맥락으로 연결)
  history.push({ role: "assistant", content: output.reply });

  // 서버는 AI의 판단을 그대로 신뢰한다 (거부권 없음).
  return {
    reply: output.reply,
    phase: output.phase,
    collected: output.collected,
  };
}
