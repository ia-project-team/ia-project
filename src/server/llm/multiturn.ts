// 멀티턴 한 턴 처리 — Vercel AI SDK 사용.
//
// OPENAI_BASE_URL 설정 시(기존 팀 프록시): generateText 구조화 출력 + JSON 파싱 보완
// 미설정(공식 OpenAI): Responses API + 구조화 출력
import "server-only";

import { generateText, Output } from "ai";

import { MULTITURN_SYSTEM_PROMPT } from "@/core/checklist/prompts";
import {
  TurnOutputSchema,
  type CollectedItem,
  type ConversationMessage,
  type TurnOutput,
} from "@/core/schemas/turn";
import type {
  PendingRagQuestion,
  StoredRagFact,
} from "@/core/rag/types";
import type { RagQuestionDecision } from "@/server/rag/questionSelector";
import {
  getOpenAI,
  getOpenAIMaxRetries,
  LUNA_PROVIDER_OPTIONS,
} from "./provider";

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
  // 최종 응답도 서버가 이 원문으로 고정해 검색 사례의 법률 답변이 섞이지 않게 한다.
  return `

# 이번 턴의 특이 사례 질문

별도 특이 사례 분석기가 다음 미확인 사실을 중요하다고 판정했습니다.
- 확인할 사실: ${decision.targetFact}
- 질문: ${decision.question}

이번 reply에는 위 질문을 한 글자도 바꾸지 말고 그대로 넣으세요.
사용자가 법률 질문을 했더라도 답변·해결책·절차 안내를 앞에 붙이지 마세요.
질문 문구를 고치거나 다른 질문을 덧붙이면 안 됩니다.
일반 체크리스트 질문은 이번 턴에 하지 마세요.
collected에는 체크리스트의 최신 상태를 누락 없이 반영하세요.`;
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

/**
 * 특이 사례 질문이 있는 턴의 출력을 확정한다.
 * 검색 사례의 답변은 사용자에게 전달하지 않고, 검증된 질문 원문만 사용한다.
 */
function finalizeReply(
  output: TurnOutput,
  ragQuestion: RagQuestionDecision | null,
): TurnOutput {
  if (!ragQuestion?.shouldAsk || !ragQuestion.question) return output;

  return {
    ...output,
    reply: ragQuestion.question,
    phase: "collecting",
  };
}

function parseJsonText(text: string): unknown {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/iu, "")
    .replace(/\s*```$/u, "")
    .trim();
  const firstBrace = withoutFence.indexOf("{");
  const lastBrace = withoutFence.lastIndexOf("}");
  const candidate = firstBrace >= 0 && lastBrace > firstBrace
    ? withoutFence.slice(firstBrace, lastBrace + 1)
    : withoutFence;
  return JSON.parse(candidate) as unknown;
}

function normalizeUserFacingOutput(output: TurnOutput): TurnOutput {
  let reply = output.reply.trim();
  // 사용자용 답변 대신 내부 메모 문장으로 시작하는 예외 응답만 제거한다.
  const metaLeadPatterns = [
    /^사용자가\s*말했다[.!]?\s*/u,
    /^사용자가\s*말한\s*내용을\s*정리해보니,[^.!?？]*[.!]\s*/u,
    /^사용자가[^.!?？]*(?:말씀하셨습니다|설명했습니다|질문했습니다|요청했습니다|묻고\s*있습니다|물어보셨습니다|궁금해\s*보여요)[.!]\s*/u,
    /^사용자가\s*물어보신[^.!?？]*답변해\s*드리겠습니다[.!]\s*/u,
    /^(?:따라서\s*)?사용자에게[^.!?？]*(?:제공|설명|안내|수집)[^.!?？]*[.!]\s*/u,
  ];
  for (const pattern of metaLeadPatterns) reply = reply.replace(pattern, "");

  return {
    ...output,
    reply: reply || output.reply,
  };
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
    const result = await generateText({
      model: openai.chat(model),
      output: Output.object({
        schema: TurnOutputSchema,
        name: "turn_output",
        description: "주택임대차 상담 한 턴의 구조화된 결과",
      }),
      system:
        systemPrompt +
        "\n\n반드시 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.",
      messages: history,
      maxRetries: getOpenAIMaxRetries(),
    });
    const rawOutput = TurnOutputSchema.parse(
      result.output ?? parseJsonText(result.text),
    );
    return finalizeReply(normalizeUserFacingOutput(rawOutput), ragQuestion);
  }

  const result = await generateText({
    model: openai.responses(model),
    output: Output.object({
      schema: TurnOutputSchema,
      name: "turn_output",
      description: "주택임대차 상담 한 턴의 구조화된 결과",
    }),
    system: systemPrompt,
    messages: history,
    maxRetries: getOpenAIMaxRetries(),
    providerOptions: LUNA_PROVIDER_OPTIONS,
  });
  const output = TurnOutputSchema.parse(result.output);
  return finalizeReply(normalizeUserFacingOutput(output), ragQuestion);
}
