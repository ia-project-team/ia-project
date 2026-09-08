// 인증(회원가입/로그인)용 Supabase 서버 클라이언트 — server-only.
// service-role 클라이언트(client.ts)와 달리 anon 키를 사용하고,
// 세션을 요청 쿠키에 보관한다 (@supabase/ssr).
import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export function hasSupabaseAuthConfig(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

export async function getSupabaseAuth() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_ANON_KEY가 .env.local에 필요합니다.");
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component에서는 쿠키를 쓸 수 없다.
          // 세션 갱신은 proxy.ts가 담당하므로 무시해도 안전하다.
        }
      },
    },
  });
}

/** 요청 쿠키를 Supabase에서 검증한 최소 사용자 정보만 반환한다. */
export async function getOptionalAuthUser(): Promise<User | null> {
  if (!hasSupabaseAuthConfig()) return null;

  try {
    const supabase = await getSupabaseAuth();
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  } catch (error) {
    console.error("[auth] 사용자 세션 확인 실패", error);
    return null;
  }
}
