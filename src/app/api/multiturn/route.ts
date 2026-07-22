// 멀티턴 상담 API 진입점.
// 요청을 받아 runSingleTurn에 위임하고 결과를 JSON으로 응답.
// 라우트는 얇게 — 판정·검색 로직은 server/llm, 상태는 server/session.
import { NextResponse } from "next/server";

import { runSingleTurn } from "@/server/llm/turnRunner";
import { store } from "@/server/session/sessionStore";
import { MULTITURN_MODEL } from "@/server/llm/provider";

export const runtime = "nodejs";

const MAX_TURNS = 20;

export async function POST(request: Request) {
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

    const session = store.getOrCreate(sessionId);
    const turnCount = session.history.filter(
      (item) => item.role === "user",
    ).length;

    if (turnCount >= MAX_TURNS) {
      return NextResponse.json(
        { error: `대화는 최대 ${MAX_TURNS}턴까지 가능합니다.` },
        { status: 429 },
      );
    }

    const result = await runSingleTurn(message, session.history, MULTITURN_MODEL);
    const duration_ms = Date.now() - t0;
    console.log(`[multiturn] sessionId=${sessionId} phase=${result.phase} duration_ms=${duration_ms}`);

    return NextResponse.json({ ...result, duration_ms });
  } catch (err) {
    console.error(`[multiturn] sessionId=${sessionId} failed_duration_ms=${Date.now() - t0}`, err);
    return NextResponse.json(
      { error: "처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
