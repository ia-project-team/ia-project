// 이메일 확인 링크 처리.
// Supabase 대시보드 → Authentication → Email Templates → Confirm signup 의
// 링크를 아래로 바꿔야 이 라우트로 들어온다:
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { getSupabaseAuth } from "@/server/supabase/authClient";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const code = searchParams.get("code");
  const type = searchParams.get("type") as EmailOtpType | null;
  const requestedNext = searchParams.get("next") ?? "/chat";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/chat";

  if (tokenHash && type) {
    const supabase = await getSupabaseAuth();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  if (code) {
    const supabase = await getSupabaseAuth();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL("/signup?error=confirm", request.url));
}
