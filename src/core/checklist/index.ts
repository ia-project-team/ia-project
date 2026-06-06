// 체크리스트 항목 정의. 도메인이 바뀌면 이 목록만 교체.
// 순수 로직 — 외부 의존 없음.

export interface ChecklistItemDef {
  key: string;
  label: string;
  required: boolean;
}

/** 전세사기 인테이크 체크리스트 */
export const CHECKLIST: ChecklistItemDef[] = [
  { key: "deposit_amount", label: "보증금 액수", required: true },
  { key: "move_in_report", label: "전입신고 여부", required: true },
  { key: "confirmed_date", label: "확정일자 여부", required: true },
  { key: "registry_check", label: "등기부 선순위 권리", required: true },
  { key: "jeonse_ratio", label: "전세가율", required: false },
  { key: "guarantee_insurance", label: "보증보험 가입 여부", required: false },
];

/** 체크리스트 정의를 프롬프트에 넣기 좋은 문자열로 변환. */
export function checklistToText(): string {
  return CHECKLIST.map((c) => {
    const tag = c.required ? "[필수]" : "[선택]";
    return `- ${tag} ${c.key}: ${c.label}`;
  }).join("\n");
}
