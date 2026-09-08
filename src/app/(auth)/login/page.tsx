import type { Metadata } from "next";

import { AuthShell } from "../_components/AuthShell";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "로그인 | LawPre",
};

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
