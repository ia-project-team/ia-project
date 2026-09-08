// 멀티턴 상담 API 진입점.
// 요청을 받아 runSingleTurn에 위임하고 결과를 JSON으로 응답.
// 라우트는 얇게 — 판정·검색 로직은 server/llm, 상태는 server/session.
import { NextResponse, type NextRequest } from "next/server";

import {
  GUEST_CHAT_LIMIT,
  GUEST_LIMIT_ERROR_CODE,
  type ChatUsage,
} from "@/core/chat/limits";
import { runSingleTurn } from "@/server/llm/turnRunner";
import { store } from "@/server/session/sessionStore";
import { MULTITURN_MODEL } from "@/server/llm/provider";
import { getOptionalAuthUser } from "@/server/supabase/authClient";
import {
  createGuestUsageToken,
  getGuestUsageSecret,
  GUEST_USAGE_COOKIE,
  GUEST_USAGE_MAX_AGE,
  readGuestUsageToken,
} from "@/server/session/guestUsage";

export const runtime = "nodejs";

function guestUsage(used: number): ChatUsage {
  return {
    authenticated: false,
    used,
    limit: GUEST_CHAT_LIMIT,
    remaining: Math.max(0, GUEST_CHAT_LIMIT - used),
  };
}

export async function POST(request: NextRequest) {
  const t0 = Date.now();
  let sessionId: string | undefined;
  try {
    const body = (await request.json()) as {
      sessionId?: unknown;
      message?: unknown;
    };
    const { message } = body;
    sessionId = typeof body.sessionId === "string" ? body.sessionId : undefined;

    if (typeof sessionId !== "string" || typeof message !== "string") {
      return NextResponse.json(
        { error: "sessionId(string)와 message(string)가 필요합니다." },
        { status: 400 },
      );
    }

    const user = await getOptionalAuthUser();
    const usageSecret = user ? null : getGuestUsageSecret();
    const used = user
      ? 0
      : readGuestUsageToken(
          request.cookies.get(GUEST_USAGE_COOKIE)?.value,
          usageSecret ?? "",
        );

    if (!user && used >= GUEST_CHAT_LIMIT) {
      return NextResponse.json(
        {
          error: "무료 대화를 모두 사용했습니다. 가입하고 상담을 계속해주세요.",
          code: GUEST_LIMIT_ERROR_CODE,
          usage: guestUsage(used),
        },
        { status: 403 },
      );
    }

    const session = await store.getOrCreate(sessionId, user?.id ?? null);
    const result = await runSingleTurn(message, session, MULTITURN_MODEL);
    await store.save(session, user?.id ?? null);
    const duration_ms = Date.now() - t0;
    console.log(`[multiturn] sessionId=${sessionId} phase=${result.phase} duration_ms=${duration_ms}`);

    const nextUsed = user ? 0 : Math.min(GUEST_CHAT_LIMIT, used + 1);
    const usage: ChatUsage = user
      ? { authenticated: true, used: 0, limit: null, remaining: null }
      : guestUsage(nextUsed);
    const response = NextResponse.json({ ...result, duration_ms, usage });

    if (!user) {
      const secret = usageSecret ?? getGuestUsageSecret();
      response.cookies.set(
        GUEST_USAGE_COOKIE,
        createGuestUsageToken(nextUsed, secret),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: GUEST_USAGE_MAX_AGE,
        },
      );
    }

    return response;
  } catch (err) {
    console.error(`[multiturn] sessionId=${sessionId} failed_duration_ms=${Date.now() - t0}`, err);
    return NextResponse.json(
      { error: "처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
