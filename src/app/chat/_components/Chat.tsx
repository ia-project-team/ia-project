"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import type { CollectedItem, Phase } from "@/core/schemas/turn";

import styles from "../chat.module.css";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import type { ChatMessage } from "./types";

interface MultiturnResponse {
  reply: string;
  phase: Phase;
  collected: CollectedItem[];
  duration_ms: number;
  error?: string;
}

const CHECKLIST_TOTAL = 16;

const INITIAL_MESSAGE: ChatMessage = {
  id: "initial-greeting",
  role: "assistant",
  text: "안녕하세요. 상담 전 사실관계 정리를 도와드릴게요.\n현재 상황을 짧게 알려주세요.",
};

function createId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getProgressLabel(completed: number, isReady: boolean): string {
  if (isReady) return "상담 준비 완료";
  if (completed < 3) return "계약 정보 확인 중";
  if (completed < 5) return "보증금 정보 확인 중";
  if (completed < 8) return "거주 정보 확인 중";
  if (completed < 11) return "통보 정보 확인 중";
  if (completed < 14) return "증거 자료 확인 중";
  if (completed < 15) return "권리 보전 확인 중";
  return "등기 정보 확인 중";
}

export function Chat() {
  // 세션 ID는 마운트 시 한 번만 생성 — 서버가 이 ID로 history를 유지한다.
  const sessionIdRef = useRef<string>(createId());

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>("collecting");
  const [collected, setCollected] = useState<CollectedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isReadyCardDismissed, setIsReadyCardDismissed] = useState(false);

  const completedCount = useMemo(
    () =>
      collected.filter(
        (item) =>
          item.status === "confirmed" || item.status === "not_applicable",
      ).length,
    [collected],
  );
  const isReady = phase === "ready_to_advise" || phase === "done";
  const progressPercent = Math.min(
    100,
    Math.round((completedCount / CHECKLIST_TOTAL) * 100),
  );
  const progressLabel = getProgressLabel(completedCount, isReady);

  const send = async (text: string) => {
    setError(null);
    setMessages((previous) => [
      ...previous,
      { id: createId(), role: "user", text },
    ]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/multiturn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          message: text,
        }),
      });

      const data = (await response.json()) as MultiturnResponse;

      if (!response.ok || data.error) {
        throw new Error(data.error ?? `요청 실패 (HTTP ${response.status})`);
      }

      setPhase(data.phase);
      setCollected(data.collected);
      setIsReadyCardDismissed(false);
      setMessages((previous) => [
        ...previous,
        { id: createId(), role: "assistant", text: data.reply },
      ]);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.chatPage}>
      <header className={styles.header}>
        <Link href="/" className={styles.logoLink} aria-label="LawPre 홈">
          <svg
            className={styles.logo}
            viewBox="0 0 230 64"
            role="img"
            aria-label="LawPre"
          >
            <path
              d="M 6 26 L 22 40 L 50 6"
              stroke="currentColor"
              strokeWidth="6.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="56" y="42" className={styles.logoText}>
              LawPre
            </text>
            <path
              d="M 22 40 Q 22 58 42 58 L 208 58"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
        </Link>
        <div className={styles.headerActions}>
          <Link href="/#footer">도움말</Link>
          <span className={styles.userAvatar} aria-label="사용자 최">
            최
          </span>
        </div>
      </header>

      <section className={styles.progressSection} aria-label="정보 수집 진행률">
        <div className={styles.progressInner}>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={CHECKLIST_TOTAL}
            aria-valuenow={completedCount}
          >
            <span
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className={styles.progressText}>
            {completedCount} / {CHECKLIST_TOTAL} ·{" "}
            <strong>{progressLabel}</strong>
          </p>
        </div>
      </section>

      <MessageList
        messages={messages}
        isStreaming={isLoading}
        showReadyCard={isReady && !isReadyCardDismissed}
        onContinue={() => setIsReadyCardDismissed(true)}
      />

      {error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : null}

      <MessageInput
        disabled={isLoading}
        isStreaming={isLoading}
        isReady={isReady}
        onSend={(text) => {
          void send(text);
        }}
      />
    </main>
  );
}
