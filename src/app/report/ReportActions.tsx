"use client";

import { useState } from "react";

import styles from "./report.module.css";

async function shareCurrentReport(): Promise<"shared" | "copied" | "idle"> {
  const shareData = {
    title: "LawPre 정리 리포트",
    text: "변호사 상담을 위해 정리한 LawPre 리포트입니다.",
    url: window.location.href,
  };

  if (typeof navigator.share === "function") {
    try {
      await navigator.share(shareData);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "idle";
      }
    }
  }

  if (navigator.clipboard) {
    await navigator.clipboard.writeText(window.location.href);
    return "copied";
  }

  return "idle";
}

export function ReportActions() {
  const [shareState, setShareState] = useState<"shared" | "copied" | "idle">(
    "idle",
  );

  const handleShare = async () => {
    try {
      setShareState(await shareCurrentReport());
    } catch {
      setShareState("idle");
    }
  };

  return (
    <div className={styles.headerActions}>
      <button
        type="button"
        className={styles.headerActionButton}
        onClick={() => window.print()}
        aria-label="PDF로 저장"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>PDF</span>
      </button>
      <button
        type="button"
        className={styles.headerActionButton}
        onClick={() => void handleShare()}
        aria-label="리포트 공유"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        <span>{shareState === "copied" ? "복사됨" : "공유"}</span>
      </button>
    </div>
  );
}

export function ReportShareButton() {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    try {
      const result = await shareCurrentReport();
      setIsCopied(result === "copied");
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <button
      type="button"
      className={styles.shareButton}
      onClick={() => void handleShare()}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
      {isCopied ? "링크가 복사됐어요" : "변호사에게 공유하기"}
    </button>
  );
}
