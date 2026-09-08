"use client";

import Link from "next/link";
import { useActionState } from "react";

import styles from "../../auth.module.css";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className={styles.form}>
      <h1 className={styles.heading}>다시 만나서 반가워요</h1>
      <p className={styles.description}>
        로그인하면 무료 이용 횟수와 관계없이 상담 준비를 계속할 수 있어요.
      </p>

      <div className={styles.field}>
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        {state?.errors?.email && (
          <p className={styles.fieldError}>{state.errors.email[0]}</p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호를 입력해주세요"
          required
        />
        {state?.errors?.password && (
          <p className={styles.fieldError}>{state.errors.password[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className={styles.formError} role="alert">{state.message}</p>
      )}

      <button type="submit" disabled={pending} className={styles.submitButton}>
        {pending ? "로그인하고 있어요..." : "로그인하고 대화 계속하기"}
      </button>
      <p className={styles.switchText}>
        아직 계정이 없나요? <Link href="/signup">무료 회원가입</Link>
      </p>
    </form>
  );
}
