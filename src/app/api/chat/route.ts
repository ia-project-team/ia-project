// API 진입점. 요청을 받아 handleChat에 위임하고 결과를 JSON으로 응답.
// 실제 진행은 엔진이 하므로 핸들러는 얇게 유지한다.

import { NextResponse } from "next/server";
import { handleChat } from "@/server/multiturn";

export async function POST(request: Request) {
  try {
    const { sessionId, message } = await request.json();

    if (!sessionId || typeof message !== "string") {
      return NextResponse.json(
        { error: "sessionId와 message가 필요합니다." },
        { status: 400 },
      );
    }

    const result = await handleChat(sessionId, message);
    return NextResponse.json(result);
  } catch (err) {
    console.error("chat route error:", err);
    return NextResponse.json(
      { error: "처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
