"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import styles from "../chat.module.css";
import type { ChatMessage } from "./types";

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  showReadyCard: boolean;
  onContinue: () => void;
}

export function MessageList({
  messages,
  isStreaming,
  showReadyCard,
  onContinue,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, showReadyCard]);

  return (
    <div className={styles.messageViewport}>
      <div className={styles.messageArea} aria-live="polite">
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <article
              key={message.id}
              className={`${styles.message} ${
                isUser ? styles.userMessage : styles.assistantMessage
              }`}
            >
              {!isUser ? (
                <span className={styles.assistantAvatar} aria-hidden="true">
                  ✓
                </span>
              ) : null}
              <p className={styles.messageBody}>{message.text}</p>
            </article>
          );
        })}

        {isStreaming ? (
          <article
            className={`${styles.message} ${styles.assistantMessage}`}
            aria-label="답변 작성 중"
          >
            <span className={styles.assistantAvatar} aria-hidden="true">
              ✓
            </span>
            <span className={styles.typingIndicator} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </article>
        ) : null}

        {showReadyCard ? (
          <section className={styles.readyCard} aria-labelledby="ready-title">
            <span className={styles.readyAvatar} aria-hidden="true">
              ✓
            </span>
            <div className={styles.readyBody}>
              <h2 id="ready-title">필요한 정보가 대부분 모였어요</h2>
              <p>
                지금까지 나눈 대화로 상담용 리포트를 만들어드릴 수 있습니다.
                확인하지 못한 내용은 리포트의 &quot;다음 단계&quot;에서 함께
                안내드릴게요.
              </p>
              <div className={styles.readyActions}>
                <Link href="/report" className={styles.reportButton}>
                  리포트 생성하기
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <button
                  type="button"
                  className={styles.continueButton}
                  onClick={onContinue}
                >
                  조금 더 대화하기
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
