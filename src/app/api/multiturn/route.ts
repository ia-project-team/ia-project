// 멀티턴 상담 API 진입점.
// 요청을 받아 runSingleTurn에 위임하고 결과를 JSON으로 응답.
// 라우트는 얇게 — 판정·검색 로직은 server/llm, 상태는 server/session.
import { NextResponse } from "next/server";

import { runSingleTurn } from "@/server/llm/turnRunner";
import { store } from "@/server/session/sessionStore";
import { MULTITURN_MODEL } from "@/server/llm/provider";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { sessionId, message } = (await request.json()) as {
      sessionId?: unknown;
      message?: unknown;
    };

    if (typeof sessionId !== "string" || typeof message !== "string") {
      return NextResponse.json(
        { error: "sessionId(string)와 message(string)가 필요합니다." },
        { status: 400 },
      );
    }

    const session = store.getOrCreate(sessionId);
    const result = await runSingleTurn(message, session.history, MULTITURN_MODEL);

    return NextResponse.json(result);
  } catch (err) {
    console.error("multiturn route error:", err);
    return NextResponse.json(
      { error: "처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
