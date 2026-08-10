// 턴 진행 — gh/multiturn-design의 orchestrator/turnRunner.ts에서 이전.
// LLM 호출이 성공한 턴만 history에 반영한다 (실패 시 세션 무변경).
// 모델 phase는 후보일 뿐이며, 서버가 누적 수집 상태를 기준으로 최종 보정한다.
import "server-only";

import { CHECKLIST, getFallbackQuestion } from "@/core/checklist";
import { retrieve } from "@/server/rag/retriever";
import {
  selectRagQuestion,
  type RagQuestionDecision,
} from "@/server/rag/questionSelector";
import { runTurn } from "./multiturn";
import type { RetrievedCase } from "@/core/rag/types";
import type { CollectedItem, TurnOutput } from "@/core/schemas/turn";
import type { Session } from "@/server/session/sessionStore";

export interface TurnResult {
  reply: string;
  phase: TurnOutput["phase"];
  collected: TurnOutput["collected"];
}

function mergeCollected(
  saved: CollectedItem[],
  latest: CollectedItem[],
): CollectedItem[] {
  const merged = new Map(saved.map((item) => [item.key, item]));
  for (const item of latest) {
    const previous = merged.get(item.key);
    // 이전에 확인된 값을 모델이 다음 턴에서 실수로 unknown으로 되돌리지 못하게 한다.
    if (previous?.status === "confirmed" && item.status === "unknown") continue;
    merged.set(item.key, item);
  }
  return [...merged.values()];
}

function missingRequiredKeys(collected: CollectedItem[]): string[] {
  const collectedByKey = new Map(collected.map((item) => [item.key, item]));

  return CHECKLIST
    .filter((item) => {
      if (!item.required) return false;
      const current = collectedByKey.get(item.key);
      return current?.status !== "confirmed" && current?.status !== "not_applicable";
    })
    .map((item) => item.key);
}

/** 모델이 조기에 종료하거나 완료를 선언해도 서버가 최종 phase를 보정한다. */
function resolveServerPhase(
  requestedPhase: TurnOutput["phase"],
  collected: CollectedItem[],
): TurnOutput["phase"] {
  const missingRequired = missingRequiredKeys(collected);
  if (missingRequired.length > 0) return "collecting";
  if (requestedPhase === "done") return "ready_to_advise";

  return requestedPhase;
}

export async function runSingleTurn(
  userMessage: string,
  session: Session,
  model: string,
): Promise<TurnResult> {
  const history = session.history;
  const turnNumber =
    history.filter((message) => message.role === "user").length + 1;
  // 답변 여부는 모델이 판정하므로 이 시점에는 미해소 상태로 둔다.
  const pendingRagQuestion = session.pendingRagQuestion;
  const messages = [
    ...history,
    { role: "user" as const, content: userMessage },
  ];

  // 상담자 질문은 검색 주제를 일반 체크리스트 쪽으로 희석하므로 사용자 진술만 사용한다.
  // 최신 진술을 한 번 더 넣어 이번 턴에 새로 등장한 특이 사실의 비중을 높인다.
  const recentUserFacts = history
    .filter((message) => message.role === "user")
    .slice(-5)
    .map((message) => message.content);
  const savedCollectedFacts = session.collected
    .filter((item) => item.status === "confirmed" && item.value)
    .map((item) => `${item.key}: ${item.value}`);
  // 이번 턴 답변은 userMessage에 이미 들어 있으므로 확정된 사실만 넣는다.
  const savedRagFacts = session.ragFacts
    .map((fact) => `${fact.targetFact}: ${fact.answer}`);
  const searchQuery = [
    userMessage,
    userMessage,
    ...recentUserFacts,
    ...savedCollectedFacts,
    ...savedRagFacts,
  ].join("\n");

  let ragCases: RetrievedCase[] = [];
  let ragQuestion: RagQuestionDecision | null = null;

  try {
    const cases = await retrieve(searchQuery, 16);

    // 관련성이 낮은 사례는 LLM에 전달하지 않는다. 실제 평가셋으로 조정할 초기값이다.
    ragCases = cases.filter((caseItem) => caseItem.score >= 0.35).slice(0, 12);

    console.log(
      "[rag] matches",
      ragCases.map((caseItem) => ({
        id: caseItem.id,
        issue: caseItem.issue,
        fit: caseItem.serviceFit,
        score: caseItem.score,
      })),
    );

    // 첫 일반 발화는 사건 맥락이 부족하고 체크리스트와 중복된 질문을 만들기 쉬우므로
    // 기본 인테이크로 시작한다. 두 번째 사용자 발화부터 사례 기반 질문을 검토한다.
    const hasPriorUserMessage = history.some((message) => message.role === "user");
    ragQuestion = hasPriorUserMessage
      ? await selectRagQuestion({
          model,
          history: messages,
          cases: ragCases,
          checklist: session.collected,
          ragFacts: session.ragFacts,
          pendingQuestion: pendingRagQuestion,
          unansweredFacts: session.unansweredRagFacts,
        })
      : null;
    console.log("[rag] question", ragQuestion);
  } catch (error) {
    // RAG 장애가 전체 상담을 막지 않도록 일단 RAG 없이 계속한다.
    console.error("[rag] retrieval failed", error);
  }

  const output = await runTurn(
    model,
    messages,
    ragQuestion,
    session.collected,
    session.ragFacts,
    pendingRagQuestion,
  );

  // 모든 모델 호출이 성공한 뒤에만 세션 상태를 한꺼번에 반영한다.
  session.collected = mergeCollected(session.collected, output.collected);
  const phase = resolveServerPhase(output.phase, session.collected);
  const missingRequired = missingRequiredKeys(session.collected);
  const reply =
    phase === "collecting" &&
    output.phase !== "collecting" &&
    missingRequired.length > 0
      ? getFallbackQuestion(missingRequired[0])
      : output.reply;

  // 모델이 답변으로 인정한 경우에만 사실로 저장한다.
  // 답을 얻지 못한 질문은 저장하지 않되, 같은 질문을 반복하지 않도록 따로 기록한다.
  if (pendingRagQuestion) {
    if (output.pendingRagAnswer) {
      session.ragFacts = [
        ...session.ragFacts,
        {
          ...pendingRagQuestion,
          answer: output.pendingRagAnswer,
          answeredAtTurn: turnNumber,
        },
      ];
    } else {
      session.unansweredRagFacts = [
        ...session.unansweredRagFacts,
        pendingRagQuestion.targetFact,
      ];
      console.log("[rag] pending question unanswered", {
        targetFact: pendingRagQuestion.targetFact,
      });
    }
  }

  session.pendingRagQuestion =
    ragQuestion?.shouldAsk && ragQuestion.question && ragQuestion.targetFact
      ? {
          targetFact: ragQuestion.targetFact,
          question: ragQuestion.question,
          sourceCaseIds: ragQuestion.sourceCaseIds,
          askedAtTurn: turnNumber,
        }
      : null;
  history.push({ role: "user", content: userMessage });
  history.push({ role: "assistant", content: reply });

  console.log("[session] state", {
    collectedConfirmed: session.collected.filter(
      (item) => item.status === "confirmed",
    ).length,
    ragFacts: session.ragFacts.map((fact) => fact.targetFact),
    unansweredRagFacts: session.unansweredRagFacts,
    pendingRagQuestion: session.pendingRagQuestion?.targetFact ?? null,
  });

  return {
    reply,
    phase,
    collected: session.collected,
  };
}
