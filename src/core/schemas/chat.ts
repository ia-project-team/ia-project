// 채팅 기본 타입. 외부 라이브러리 의존 없음.
export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}
