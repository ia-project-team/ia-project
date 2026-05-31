import type { UIMessage } from "ai";

export type ChatRole = "user" | "assistant" | "system";

export interface Message {
  role: ChatRole;
  content: string;
}

export type ChatUIMessage = UIMessage;
