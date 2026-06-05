// AI 출력 스키마 (c안).
//
// (b)안과 비교:
//   (b) checklistUpdates: 항목별 filled/confidence를 서버가 받아 "통제"에 사용
//   (c) collected: AI가 관리하는 진행 스냅샷을 서버는 그냥 "보관/표시"만
// 즉 (c)에서는 confidence 같은 통제용 필드가 사라진다. 서버가 그걸로
// 거를 일이 없기 때문이다. 판단·진행이 모두 AI 쪽에 있다.

import { z } from "zod";

/** AI가 관리하는, 지금까지 확인된 항목 하나의 스냅샷. */
export const CollectedItem = z.object({
  key: z.string().describe("체크리스트 항목 식별자"),
  status: z
    .enum(["confirmed", "unknown", "not_applicable"])
    .describe("confirmed=확인됨, unknown=아직, not_applicable=해당없음/모름"),
  value: z.string().nullable().describe("확인된 값 또는 메모. 없으면 null"),
});

/** 매 턴 AI가 반환하는 전체 구조. */
export const TurnOutput = z.object({
  reply: z.string().describe("사용자에게 보여줄 다음 발화"),
  collected: z
    .array(CollectedItem)
    .describe("지금까지 확인된 항목들의 현재 스냅샷 (AI가 관리)"),
  phase: z
    .enum(["collecting", "ready_to_advise", "done"])
    .describe("대화 단계. AI가 스스로 판단해 선언"),
});

export type TurnOutput = z.infer<typeof TurnOutput>;
export type CollectedItem = z.infer<typeof CollectedItem>;
