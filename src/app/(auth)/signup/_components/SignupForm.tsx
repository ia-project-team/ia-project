"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signup } from "../actions";
import styles from "../../auth.module.css";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  if (state?.success) {
    return (
      <div className={styles.successCard}>
        <span className={styles.successIcon} aria-hidden="true">✓</span>
        <h1>이메일을 확인해주세요</h1>
        <p>{state.message}</p>
        <Link href="/login">이미 확인했다면 로그인하기 →</Link>
      </div>
    );
  }

  return (
    <form
      action={action}
      className={styles.form}
    >
      <h1 className={styles.heading}>무료로 계속하기</h1>
      <p className={styles.description}>
        1분이면 가입할 수 있어요. 진행 중인 상담 준비는 그대로 이어집니다.
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
            autoComplete="new-password"
            placeholder="8자 이상, 영문+숫자"
            required
          />
          {state?.errors?.password && (
            <ul className={styles.fieldError}>
              {state.errors.password.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
          {state?.errors?.confirmPassword && (
            <p className={styles.fieldError}>
              {state.errors.confirmPassword[0]}
            </p>
          )}
        </div>
      {state?.message && (
        <p className={styles.formError} role="alert">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={styles.submitButton}
      >
        {pending ? "계정을 만들고 있어요..." : "가입하고 대화 계속하기"}
      </button>
      <p className={styles.switchText}>
        이미 계정이 있나요? <Link href="/login">로그인</Link>
      </p>
      <p className={styles.terms}>
        가입을 진행하면 LawPre의 이용약관과 개인정보 처리방침에 동의하게 됩니다.
      </p>
    </form>
  );
}
