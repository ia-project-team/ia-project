"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { GUEST_CHAT_LIMIT } from "@/core/chat/limits";

import styles from "../chat.module.css";
import type { ChatMessage } from "./types";

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  showReadyCard: boolean;
  showSignupGate: boolean;
  onContinue: () => void;
}

export function MessageList({
  messages,
  isStreaming,
  showReadyCard,
  showSignupGate,
  onContinue,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, showReadyCard, showSignupGate]);

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

        {showSignupGate ? (
          <section className={styles.signupGate} aria-labelledby="signup-gate-title">
            <div className={styles.signupGateIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </div>
            <span className={styles.signupGateEyebrow}>
              무료 대화 {GUEST_CHAT_LIMIT}회를 모두 사용했어요
            </span>
            <h2 id="signup-gate-title">여기까지 정리한 내용,<br />가입하고 그대로 이어가세요</h2>
            <p>
              지금 만든 계정으로 로그인하면 대화가 사라지지 않고,
              상담용 리포트가 완성될 때까지 계속 답변할 수 있어요.
            </p>
            <div className={styles.signupGateActions}>
              <Link href="/signup" className={styles.signupPrimary}>무료 회원가입</Link>
              <Link href="/login" className={styles.signupSecondary}>이미 계정이 있어요</Link>
            </div>
            <small>카드 등록 없이 이메일로 간편하게 시작합니다</small>
          </section>
        ) : null}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
