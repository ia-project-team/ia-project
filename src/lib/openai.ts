import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";

let cached: OpenAIProvider | null = null;

export function getOpenAI(): OpenAIProvider {
  if (cached) return cached;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Define it in .env.local before calling the chat API.",
    );
  }

  cached = createOpenAI({ apiKey });
  return cached;
}

export const DEFAULT_CHAT_MODEL = "gpt-4o-mini";
