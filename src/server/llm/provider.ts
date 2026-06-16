// OpenAI 프로바이더 팩토리 — server-only.
// 두 브랜치의 LLM 호출이 여기 단일 경로를 쓴다.
import "server-only";

import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";

let cached: OpenAIProvider | null = null;

export function getOpenAI(): OpenAIProvider {
  if (cached) return cached;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Define it in .env.local before calling the LLM.",
    );
  }

  cached = createOpenAI({ apiKey, baseURL: process.env.OPENAI_BASE_URL });
  return cached;
}

/** 일반 채팅용 기본 모델 */
export const DEFAULT_CHAT_MODEL = "gpt-4o-mini";

/** 멀티턴 상담용 모델 (환경변수로 덮어쓸 수 있음) */
export const MULTITURN_MODEL = process.env.MULTITURN_MODEL ?? "gpt-4o";
