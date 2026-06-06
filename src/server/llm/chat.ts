// 스트리밍 채팅 — feat/chat 브랜치의 chat-service.ts에서 이전.
import "server-only";

import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { getOpenAI, DEFAULT_CHAT_MODEL } from "./provider";
import { CHAT_SYSTEM_PROMPT } from "@/core/checklist/prompts";

export interface StreamChatInput {
  messages: UIMessage[];
}

export async function streamChat({ messages }: StreamChatInput): Promise<Response> {
  const openai = getOpenAI();

  const result = streamText({
    model: openai(DEFAULT_CHAT_MODEL),
    system: CHAT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
