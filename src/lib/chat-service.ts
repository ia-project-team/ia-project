import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { DEFAULT_CHAT_MODEL, getOpenAI } from "@/lib/openai";
import { SYSTEM_PROMPT } from "@/lib/chat";

export interface StreamChatInput {
  messages: UIMessage[];
}

export async function streamChat({ messages }: StreamChatInput): Promise<Response> {
  const openai = getOpenAI();

  const result = streamText({
    model: openai(DEFAULT_CHAT_MODEL),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
