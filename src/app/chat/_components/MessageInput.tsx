"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";

import styles from "../chat.module.css";

interface MessageInputProps {
  disabled: boolean;
  onSend: (text: string) => void;
  isStreaming: boolean;
  isReady: boolean;
}

export function MessageInput({
  disabled,
  onSend,
  isStreaming,
  isReady,
}: MessageInputProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form className={styles.inputArea} onSubmit={handleSubmit}>
      <div className={styles.inputInner}>
        <button
          type="button"
          className={styles.attachmentButton}
          aria-label="파일 첨부"
          title="파일 첨부 기능은 준비 중입니다."
          disabled
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={
            isReady ? "더 추가할 내용이 있으신가요?" : "답변을 입력해주세요."
          }
          className={styles.textarea}
          disabled={disabled}
          aria-label="메시지"
        />
        <button
          type="submit"
          disabled={disabled || value.trim().length === 0}
          className={styles.sendButton}
          aria-label={isStreaming ? "답변 기다리는 중" : "메시지 전송"}
        >
          {isStreaming ? (
            <span className={styles.sendLoader} aria-hidden="true" />
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
      <p className={styles.inputHint}>
        {isReady
          ? "내용을 더 추가하거나 리포트 생성 버튼으로 다음 단계에 진행하세요."
          : "Enter로 전송 · Shift + Enter로 줄바꿈"}
      </p>
    </form>
  );
}
