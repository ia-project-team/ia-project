"use client";

import { useRef, useState } from "react";

import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import type { ChatMessage } from "./types";
import type { Phase, CollectedItem } from "@/core/schemas/turn";

interface MultiturnResponse {
  reply: string;
  phase: Phase;
  collected: CollectedItem[];
  duration_ms: number;
  error?: string;
}

const PHASE_LABEL: Record<Phase, string> = {
  collecting: "정보 수집 중",
  ready_to_advise: "상담 준비 완료",
  done: "상담 종료",
};

export function Chat() {
  // 세션 ID는 마운트 시 한 번만 생성 — 서버가 이 ID로 history를 유지한다.
  const sessionIdRef = useRef<string>(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `session-${Date.now()}`,
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = async (text: string) => {
    setError(null);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text },
    ]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/multiturn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current, message: text }),
      });

      const data = (await res.json()) as MultiturnResponse;

      if (!res.ok || data.error) {
        throw new Error(data.error ?? `요청 실패 (HTTP ${res.status})`);
      }

      setPhase(data.phase);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: data.reply },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full max-w-3xl flex-1 flex-col">
      {phase ? (
        <div className="border-b border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-400">
          단계: {PHASE_LABEL[phase]}
        </div>
      ) : null}
      <MessageList messages={messages} isStreaming={isLoading} />
      {error ? (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          오류: {error}
        </div>
      ) : null}
      <MessageInput
        disabled={isLoading}
        isStreaming={isLoading}
        onSend={(text) => {
          void send(text);
        }}
      />
    </div>
  );
}
