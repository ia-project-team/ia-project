// 멀티턴 엔진 스키마 — 단일 출처.
// z.infer로 TypeScript 타입을 뽑아 쓴다 (스키마 우선).
import { z } from "zod";

// ── 대화 메시지 ──────────────────────────────────────────────────────────────

/** 대화 한 줄. LLM에 history로 그대로 전달된다. */
export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

// ── AI 출력 스키마 (Zod) ─────────────────────────────────────────────────────

/** AI가 관리하는, 지금까지 확인된 항목 하나의 스냅샷. */
export const CollectedItemSchema = z.object({
  key: z.string().describe("체크리스트 항목 식별자"),
  status: z
    .enum(["confirmed", "unknown", "not_applicable"])
    .describe("confirmed=확인됨, unknown=아직, not_applicable=해당없음/모름"),
  value: z.string().nullable().describe("확인된 값 또는 메모. 없으면 null"),
});

/** 매 턴 AI가 반환하는 전체 구조. */
export const TurnOutputSchema = z
  .object({
    reply: z.string().describe("사용자에게 보여줄 다음 발화"),
    collected: z
      .array(CollectedItemSchema)
      .describe("지금까지 확인된 항목들의 현재 스냅샷 (AI가 관리)"),
    phase: z
      .enum(["collecting", "ready_to_advise", "done"])
      .describe("대화 단계. AI가 스스로 판단해 선언"),
    pendingRagAnswer: z
      .string()
      .nullable()
      .describe(
        "직전 턴에 물어본 특이 사례 질문에 사용자가 답했으면 그 답의 짧은 요약. " +
          "답하지 않았거나 대기 중인 질문이 없으면 null",
      ),
  })
  .strict();

// ── 추론된 TypeScript 타입 ───────────────────────────────────────────────────

export type CollectedItem = z.infer<typeof CollectedItemSchema>;
export type TurnOutput = z.infer<typeof TurnOutputSchema>;
export type Phase = TurnOutput["phase"];
