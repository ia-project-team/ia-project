import Link from "next/link";
import type { ReactNode } from "react";

import styles from "../auth.module.css";

function Logo({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 230 64" aria-label="LawPre">
      <path
        d="M 6 26 L 22 40 L 50 6"
        stroke="currentColor"
        strokeWidth="6.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x="56" y="42" className={styles.logoText}>LawPre</text>
      <path
        d="M 22 40 Q 22 58 42 58 L 208 58"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.authPage}>
      <section className={styles.brandPanel} aria-label="LawPre 소개">
        <Link href="/" aria-label="LawPre 홈">
          <Logo className={styles.brandLogo} />
        </Link>
        <div className={styles.brandMessage}>
          <span className={styles.brandEyebrow}>상담 준비, 여기서 이어가세요</span>
          <h2>흩어진 사실이<br />선명한 상담 자료로.</h2>
          <p>
            가입하면 지금까지 정리한 대화를 그대로 이어서 필요한 자료와
            다음 단계를 끝까지 확인할 수 있어요.
          </p>
        </div>
        <p className={styles.brandFoot}>
          <span aria-hidden="true">✓</span>
          입력한 정보는 상담 준비 목적으로만 사용됩니다
        </p>
      </section>
      <section className={styles.formPanel}>
        <div className={styles.formWrap}>
          <Link href="/" aria-label="LawPre 홈">
            <Logo className={styles.formLogo} />
          </Link>
          <Link href="/chat" className={styles.backLink}>← 대화로 돌아가기</Link>
          {children}
        </div>
      </section>
    </main>
  );
}
