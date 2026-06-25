"use client";

import { useEffect, useRef } from "react";

import type { ChatMessage } from "./types";

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-500 dark:text-zinc-400">
        <p>메시지를 입력해 대화를 시작하세요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
      {messages.map((message) => {
        const isUser = message.role === "user";
        return (
          <div
            key={message.id}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-6 ${
                isUser
                  ? "bg-black text-white dark:bg-zinc-100 dark:text-black"
                  : "bg-zinc-100 text-black dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {message.text || <span className="text-zinc-400">…</span>}
            </div>
          </div>
        );
      })}
      {isStreaming ? (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl bg-zinc-100 px-4 py-2 text-sm leading-6 text-zinc-400 dark:bg-zinc-800">
            …
          </div>
        </div>
      ) : null}
      <div ref={bottomRef} />
    </div>
  );
}
