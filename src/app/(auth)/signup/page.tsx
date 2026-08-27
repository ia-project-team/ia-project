import type { Metadata } from "next";

import { SignupForm } from "./_components/SignupForm";

export const metadata: Metadata = {
  title: "회원가입",
};

export default function SignupPage() {
  return (
    <main className="flex h-dvh w-full flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <SignupForm />
    </main>
  );
}
