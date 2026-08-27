// Supabase 세션 갱신 — 만료된 auth 토큰을 요청마다 갱신해 쿠키에 다시 써 준다.
// (Next 16: middleware.ts 는 deprecated, proxy.ts 로 대체됨)
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  // 인증 환경변수가 없으면 (예: RAG만 쓰는 환경) 그냥 통과시킨다.
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser()가 만료된 토큰을 감지해 갱신을 트리거한다. 결과는 쓰지 않는다.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
