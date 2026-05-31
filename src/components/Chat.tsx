"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";

import { MessageInput } from "@/components/MessageInput";
import { MessageList } from "@/components/MessageList";

export function Chat() {
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isStreaming = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-full w-full max-w-3xl flex-1 flex-col">
      <MessageList messages={messages} isStreaming={isStreaming} />
      {error ? (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          오류: {error.message}
        </div>
      ) : null}
      <MessageInput
        disabled={isStreaming}
        isStreaming={isStreaming}
        onStop={stop}
        onSend={(text) => {
          void sendMessage({ text });
        }}
      />
    </div>
  );
}
