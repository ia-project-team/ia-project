"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  GUEST_LIMIT_ERROR_CODE,
  type ChatUsage,
} from "@/core/chat/limits";
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
  usage?: ChatUsage;
  code?: string;
  error?: string;
}

const CHECKLIST_TOTAL = 16;

const INITIAL_MESSAGE: ChatMessage = {
  id: "initial-greeting",
  role: "assistant",
  text: "안녕하세요. 상담 전 사실관계 정리를 도와드릴게요.\n현재 상황을 짧게 알려주세요.",
};

const CHAT_STORAGE_KEY = "lawpre-active-chat-v2";
const CHAT_STORAGE_TTL_MS = 24 * 60 * 60 * 1000;

interface SavedChat {
  sessionId: string;
  messages: ChatMessage[];
  phase: Phase;
  collected: CollectedItem[];
  savedAt: number;
}

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

interface ChatProps {
  initialUsage: ChatUsage;
  userEmail: string | null;
}

function isSavedChat(value: unknown): value is SavedChat {
  if (!value || typeof value !== "object") return false;
  const saved = value as Partial<SavedChat>;
  return (
    typeof saved.sessionId === "string" &&
    Array.isArray(saved.messages) &&
    typeof saved.phase === "string" &&
    Array.isArray(saved.collected) &&
    typeof saved.savedAt === "number"
  );
}

export function Chat({ initialUsage, userEmail }: ChatProps) {
  // 세션 ID는 마운트 시 한 번만 생성 — 서버가 이 ID로 history를 유지한다.
  const sessionIdRef = useRef<string>(createId());

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>("collecting");
  const [collected, setCollected] = useState<CollectedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isReadyCardDismissed, setIsReadyCardDismissed] = useState(false);
  const [usage, setUsage] = useState(initialUsage);
  const [isStorageReady, setIsStorageReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
        const saved: unknown = raw ? JSON.parse(raw) : null;
        if (isSavedChat(saved)) {
          if (Date.now() - saved.savedAt > CHAT_STORAGE_TTL_MS) {
            window.localStorage.removeItem(CHAT_STORAGE_KEY);
          } else {
            sessionIdRef.current = saved.sessionId;
            setMessages(saved.messages);
            setPhase(saved.phase);
            setCollected(saved.collected);
          }
        }
      } catch {
        window.localStorage.removeItem(CHAT_STORAGE_KEY);
      } finally {
        setIsStorageReady(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isStorageReady) return;
    const saved: SavedChat = {
      sessionId: sessionIdRef.current,
      messages,
      phase,
      collected,
      savedAt: Date.now(),
    };
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(saved));
  }, [collected, isStorageReady, messages, phase]);

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
  const isGuestLocked =
    !usage.authenticated && usage.remaining !== null && usage.remaining <= 0;

  const send = async (text: string) => {
    if (isGuestLocked) return;
    setError(null);
    const pendingMessageId = createId();
    setMessages((previous) => [
      ...previous,
      { id: pendingMessageId, role: "user", text },
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

      if (data.code === GUEST_LIMIT_ERROR_CODE && data.usage) {
        setUsage(data.usage);
        setMessages((previous) =>
          previous.filter((message) => message.id !== pendingMessageId),
        );
        return;
      }

      if (!response.ok || data.error) {
        throw new Error(data.error ?? `요청 실패 (HTTP ${response.status})`);
      }

      setPhase(data.phase);
      setCollected(data.collected);
      if (data.usage) setUsage(data.usage);
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
          {usage.authenticated ? (
            <>
              <span className={styles.memberLabel}>회원 이용 중</span>
              <form
                action="/auth/logout"
                method="post"
                onSubmit={() => window.localStorage.removeItem(CHAT_STORAGE_KEY)}
              >
                <button type="submit" className={styles.headerTextButton}>로그아웃</button>
              </form>
              <span className={styles.userAvatar} aria-label="로그인 사용자">
                {(userEmail?.trim().charAt(0) || "회").toUpperCase()}
              </span>
            </>
          ) : (
            <>
              <span className={styles.usagePill}>
                무료 {usage.remaining}회 남음
              </span>
              <Link href="/login" className={styles.loginLink}>로그인</Link>
              <span className={styles.guestAvatar} aria-label="비회원 사용자">
                G
              </span>
            </>
          )}
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
        showSignupGate={isGuestLocked}
        onContinue={() => setIsReadyCardDismissed(true)}
      />

      {error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : null}

      <MessageInput
        disabled={isLoading || isGuestLocked}
        isStreaming={isLoading}
        isReady={isReady}
        isGuestLocked={isGuestLocked}
        onSend={(text) => {
          void send(text);
        }}
      />
    </main>
  );
}
