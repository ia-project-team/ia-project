"use client";

import { useActionState } from "react";

import { signup } from "../actions";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  if (state?.success) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
          이메일을 확인해주세요
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h1 className="text-lg font-semibold text-black dark:text-zinc-50">회원가입</h1>

      <div className="mt-6 flex flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm leading-6 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
          {state?.errors?.email && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {state.errors.email[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="8자 이상, 영문+숫자"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm leading-6 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
          {state?.errors?.password && (
            <ul className="mt-1 text-xs text-red-600 dark:text-red-400">
              {state.errors.password.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm leading-6 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
          {state?.errors?.confirmPassword && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {state.errors.confirmPassword[0]}
            </p>
          )}
        </div>
      </div>

      {state?.message && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 h-10 w-full rounded-full bg-black text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-zinc-100 dark:text-black dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
      >
        {pending ? "가입 중..." : "가입하기"}
      </button>
    </form>
  );
}
