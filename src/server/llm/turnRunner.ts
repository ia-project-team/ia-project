// 턴 진행 — gh/multiturn-design의 orchestrator/turnRunner.ts에서 이전.
// LLM 호출이 성공한 턴만 history에 반영한다 (실패 시 세션 무변경).
// 서버는 AI의 phase 판단을 신뢰한다 (거부권 없음).
import "server-only";

import { retrieve } from "@/server/rag/retriever";
import { runTurn } from "./multiturn";
import type { RetrievedChunk } from "@/core/rag/types";
import type { ConversationMessage, TurnOutput } from "@/core/schemas/turn";

export interface TurnResult {
  reply: string;
  phase: TurnOutput["phase"];
  collected: TurnOutput["collected"];
}

export async function runSingleTurn(
  userMessage: string,
  history: ConversationMessage[],
  model: string,
): Promise<TurnResult> {
  const messages = [
    ...history,
    { role: "user" as const, content: userMessage },
  ];

  // 짧은 후속 답변도 이해할 수 있도록 최근 대화를 검색 질의에 포함한다.
  const searchQuery = [
    ...history.slice(-4).map((message) => message.content),
    userMessage,
  ].join("\n");

  let ragChunks: RetrievedChunk[] = [];

  try {
    const chunks = await retrieve(searchQuery);

    // 관련성이 낮은 문서는 LLM에 전달하지 않는다.
    ragChunks = chunks.filter((chunk) => chunk.score >= 0.35);

    console.log(
      "[rag] matches",
      ragChunks.map((chunk) => ({
        topic: chunk.topic,
        score: chunk.score,
      })),
    );
  } catch (error) {
    // RAG 장애가 전체 상담을 막지 않도록 일단 RAG 없이 계속한다.
    console.error("[rag] retrieval failed", error);
  }

  const output = await runTurn(model, messages, ragChunks);

  history.push({ role: "user", content: userMessage });
  history.push({ role: "assistant", content: output.reply });

  return {
    reply: output.reply,
    phase: output.phase,
    collected: output.collected,
  };
}
