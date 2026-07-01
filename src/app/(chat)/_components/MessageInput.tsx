"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";

interface MessageInputProps {
  disabled: boolean;
  onSend: (text: string) => void;
  onStop?: () => void;
  isStreaming: boolean;
}

export function MessageInput({
  disabled,
  onSend,
  onStop,
  isStreaming,
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
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black"
    >
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="메시지를 입력하세요. Shift+Enter로 줄바꿈"
        className="flex-1 resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm leading-6 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        disabled={disabled}
      />
      {isStreaming && onStop ? (
        <button
          type="button"
          onClick={onStop}
          className="h-10 rounded-full bg-zinc-200 px-4 text-sm font-medium text-black hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600"
        >
          중지
        </button>
      ) : (
        <button
          type="submit"
          disabled={disabled || value.trim().length === 0}
          className="h-10 rounded-full bg-black px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-zinc-100 dark:text-black dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
        >
          전송
        </button>
      )}
    </form>
  );
}
