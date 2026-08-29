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

/** 테스트 등에서 AI SDK의 자동 재시도 횟수를 명시적으로 제한한다. */
export function getOpenAIMaxRetries(): number | undefined {
  const configured = process.env.OPENAI_MAX_RETRIES;
  if (configured === undefined) return undefined;

  const parsed = Number(configured);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error("OPENAI_MAX_RETRIES must be a non-negative integer.");
  }
  return parsed;
}

/** 생성 작업은 검증한 GPT-5.6 Luna 한 모델로 통일한다. */
export const LUNA_MODEL = "gpt-5.6-luna";
export const DEFAULT_CHAT_MODEL = LUNA_MODEL;
export const MULTITURN_MODEL = LUNA_MODEL;

/** 공식 가이드의 기본값과 기존 Luna 평가 조건을 명시적으로 고정한다. */
export const LUNA_PROVIDER_OPTIONS = {
  openai: {
    reasoningEffort: "medium",
    textVerbosity: "low",
  },
} as const;
