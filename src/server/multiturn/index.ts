// 멀티턴 엔진 진입점 (c안).
//
// "server-only"로 클라이언트 번들 혼입을 차단(OpenAI 키 보호).
import "server-only";

import { runSingleTurn } from "./orchestrator/turnRunner";
import { store } from "./state/sessionStore";
import { MODEL } from "./config";
import type { Phase } from "./types";
import type { CollectedItem } from "./llm/schemas";

export interface ChatResponse {
  reply: string;
  phase: Phase;
  collected: CollectedItem[];
}

/** 한 턴 처리 후 클라이언트에 보낼 응답을 반환. route.ts에서 이것만 호출. */
export async function handleChat(
  sessionId: string,
  userMessage: string,
): Promise<ChatResponse> {
  const session = store.getOrCreate(sessionId);

  const { reply, phase, collected } = await runSingleTurn(
    userMessage,
    session.history,
    MODEL,
  );

  return { reply, phase, collected };
}
