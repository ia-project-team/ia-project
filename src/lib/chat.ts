import type { Message } from "@/types/chat";

export interface ContextProvider {
  getContext(): Promise<Message[]>;
}

export const SYSTEM_PROMPT =
  "You are a helpful assistant. Reply concisely in the user's language.";
