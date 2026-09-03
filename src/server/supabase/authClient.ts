// 인증(회원가입/로그인)용 Supabase 서버 클라이언트 — server-only.
// service-role 클라이언트(client.ts)와 달리 anon 키를 사용하고,
// 세션을 요청 쿠키에 보관한다 (@supabase/ssr).
import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
