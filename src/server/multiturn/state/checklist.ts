// 체크리스트 "정의" (c안).
//
// (b)안과의 핵심 차이: 여기엔 충족 판정 로직(확신도 게이트, 환각 방어)이
// 없다. (c)안에서는 충족 여부 판단과 진행 관리를 AI가 맡으므로, 서버는
// "어떤 항목이 있는지"라는 정의만 들고 있다가 프롬프트에 실어 보낼 뿐이다.
//
// 즉 (b)는 이 파일이 "통제자"였고, (c)는 "참고 자료"로 가벼워진다.

import type { ChecklistItemDef } from "../types";

/** 전세사기 인테이크 예시 정의. 도메인이 바뀌면 이 목록만 교체. */
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
