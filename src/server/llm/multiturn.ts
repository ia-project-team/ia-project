// 멀티턴 한 턴 처리 — Vercel AI SDK 사용.
//
// OPENAI_BASE_URL 설정 시(프록시): generateText + 수동 JSON 파싱
// 미설정(공식 OpenAI): generateObject (JSON 스키마 강제)
import "server-only";

import { generateObject, generateText } from "ai";

import { MULTITURN_SYSTEM_PROMPT } from "@/core/checklist/prompts";
import {
  TurnOutputSchema,
  type CollectedItem,
  type ConversationMessage,
  type TurnOutput,
} from "@/core/schemas/turn";
import type { PendingRagQuestion, StoredRagFact } from "@/core/rag/types";
import {
  normalizeForQuote,
  type RagQuestionDecision,
} from "@/server/rag/questionSelector";
import { getOpenAI } from "./provider";

/**
 * 직전 턴의 특이 질문에 사용자가 답했는지 모델이 판정하게 한다.
 * 코드가 "다음 메시지 = 답변"으로 단정하면 질문을 무시한 발화도 사실로 굳는다.
 */
function formatPendingRagQuestion(pending: PendingRagQuestion | null): string {
  if (!pending) {
    return `

# 직전 특이 사례 질문

대기 중인 특이 사례 질문이 없습니다. pendingRagAnswer는 반드시 null로 두세요.`;
  }

  return `

# 직전 턴에 물어본 특이 사례 질문

- 확인하려던 사실: ${pending.targetFact}
- 물어본 질문: ${pending.question}

이번 사용자 발화가 위 질문에 대한 답이면, 그 답을 pendingRagAnswer에 짧게 요약해 넣으세요.
"모른다"·"기억나지 않는다"·"해당 없다"도 답변이므로 그대로 요약해 넣습니다.
위 질문과 무관한 이야기만 했다면 pendingRagAnswer를 null로 두세요.
사용자가 답하지 않았는데 값을 지어내면 안 됩니다.`;
}

function formatForcedRagQuestion(decision: RagQuestionDecision | null): string {
  if (!decision?.shouldAsk || !decision.question) return "";

  // 질문 문구 자체는 questionSelector의 검증을 통과한 것이므로 모델이 바꾸면 안 된다.
  // 모델에는 앞에 붙일 공감 문장만 맡기고, 실제 반영 여부는 finalizeReply가 검증한다.
  return `

# 이번 턴의 특이 사례 질문

별도 특이 사례 분석기가 다음 미확인 사실을 중요하다고 판정했습니다.
- 확인할 사실: ${decision.targetFact}
- 질문: ${decision.question}

이번 reply는 다음 두 부분으로만 구성하세요.
1) 사용자가 방금 말한 내용에 대한 짧은 공감·확인 한 문장 (여기서 질문하지 마세요)
2) 위 질문을 한 글자도 바꾸지 말고 그대로 이어붙이기

질문 문구를 고치거나 다른 질문을 덧붙이면 안 됩니다.
일반 체크리스트 질문은 이번 턴에 하지 마세요.
분석 과정이나 법률적 결론은 말하지 마세요.
collected는 현재 사용자 발화에서 확인된 체크리스트 사실을 평소처럼 모두 갱신하세요.`;
}

function formatSavedSessionContext(
  checklist: CollectedItem[],
  ragFacts: StoredRagFact[],
): string {
  const checklistText = checklist.length > 0
    ? checklist.map((item) =>
      `- ${item.key}: ${item.status}${item.value ? ` (${item.value})` : ""}`
    ).join("\n")
    : "- 아직 저장된 항목 없음";
  const ragFactText = ragFacts.length > 0
    ? ragFacts.map((fact) => `- ${fact.targetFact}: ${fact.answer}`).join("\n")
    : "- 아직 저장된 특이 사실 없음";

  return `

# 세션에 저장된 상담 상태

다음은 이전 턴에서 확정해 저장한 상태입니다. 이미 확인된 내용을 다시 묻지 말고,
collected에는 체크리스트의 최신 상태를 누락 없이 반영하세요.

## 체크리스트
${checklistText}

## RAG 사례로 발견해 질문·답변이 끝난 특이 사실
${ragFactText}`;
}

function countQuestionMarks(value: string): number {
  return value.match(/[?？]/g)?.length ?? 0;
}

/**
 * 모델이 다듬은 reply를 그대로 써도 되는지 판단한다.
 * 검증된 질문을 글자 그대로 담고, 그 밖의 질문을 덧붙이지 않아야 한다.
 */
function acceptsModelReply(reply: string, question: string): boolean {
  const normalizedReply = normalizeForQuote(reply);
  const normalizedQuestion = normalizeForQuote(question);
  if (!normalizedReply.includes(normalizedQuestion)) return false;

  return countQuestionMarks(normalizedReply) <= countQuestionMarks(normalizedQuestion);
}

/**
 * 특이 사례 질문이 있는 턴의 출력을 확정한다.
 * 모델 문장이 검증을 통과하면 그대로 쓰고, 실패하면 검증된 질문 원문으로 되돌린다.
 */
function finalizeReply(
  output: TurnOutput,
  ragQuestion: RagQuestionDecision | null,
): TurnOutput {
  if (!ragQuestion?.shouldAsk || !ragQuestion.question) return output;

  if (acceptsModelReply(output.reply, ragQuestion.question)) {
    return { ...output, phase: "collecting" };
  }

  console.log("[rag] model reply rejected, falling back to raw question", {
    targetFact: ragQuestion.targetFact,
    modelReply: output.reply,
  });
  return { ...output, reply: ragQuestion.question, phase: "collecting" };
}

/** 대화 기록 전체를 넘겨 한 턴을 처리한다. */
export async function runTurn(
  model: string,
  history: ConversationMessage[],
  ragQuestion: RagQuestionDecision | null = null,
  checklist: CollectedItem[] = [],
  ragFacts: StoredRagFact[] = [],
  pendingRagQuestion: PendingRagQuestion | null = null,
): Promise<TurnOutput> {
  const openai = getOpenAI();
  const systemPrompt =
    MULTITURN_SYSTEM_PROMPT +
    formatSavedSessionContext(checklist, ragFacts) +
    formatPendingRagQuestion(pendingRagQuestion) +
    formatForcedRagQuestion(ragQuestion);

  if (process.env.OPENAI_BASE_URL) {
    const { text } = await generateText({
      model: openai.chat(model),
      system:
        systemPrompt +
        "\n\n반드시 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.",
      messages: history,
    });

    const json = JSON.parse(text.trim()) as unknown;
    return finalizeReply(TurnOutputSchema.parse(json), ragQuestion);
  }

  const { object } = await generateObject({
    model: openai(model),
    schema: TurnOutputSchema,
    system: systemPrompt,
    messages: history,
  });

  return finalizeReply(object, ragQuestion);
}
