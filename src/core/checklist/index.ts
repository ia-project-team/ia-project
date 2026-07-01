// 체크리스트 항목 정의. 도메인이 바뀌면 이 목록만 교체.
// 순수 로직 — 외부 의존 없음.

export interface ChecklistItemDef {
  key: string;
  label: string;
  required: boolean;
}

/** 전세사기 인테이크 체크리스트(16) */
export const CHECKLIST: ChecklistItemDef[] = [
  // 계약 정보(3)
  { key: "has_contract_doc",
    label: "임대차계약서 보유 여부",
    required: true,
  },
  { key: "contract_start_date",
    label: "계약 시작일",
    required: true
  },
  { key: "contract_end_date",
    label: "계약 종료일",
    required: true
  },
  // 금전 정보(2)
  { key: "deposit_amount", 
    label: "보증금 액수",
    required: true
  },
  { key: "unreturned_amount",
    label: "미반환 금액",
    required: true
  },
  // 거주 정보(3)
  { key: "has_resident_reg",
    label: "전입신고 여부",
    required: true
  },
  { key: "has_fixed_date",
    label: "확정일자 여부",
    required: true
  },
  { key: "has_moved_out",
    label: "실제 퇴거 여부",
    required: true
  },
  // 통보 정보(3)
  { key: "notice_date",
    label: "계약 종료 통보 시점",
    required: true
  },
  { key: "notice_method",
    label: "통보 방식",
    required: true
  },
  { key: "landlord_responded",
    label: "임대인 답변 여부",
    required: false
  },
  // 증거 자료(3)
  { key: "has_kakao_records",
    label: "카카오톡/문자 내역",
    required: false,
  },
  { key: "has_certified_mail",
    label: "내용증명 여부",
    required: false
  },
  { key: "has_transfer_records",
    label: "계좌이체 내역",
    required: false
  },
  // 권리 보전(1)
  { key: "has_lien_registration",
    label: "임차권등기명령 신청 여부",
    required: false,
  },
  // 추가 위험 요소(1)
  { 
    key: "registry_check", 
    label: "등기부 선순위 권리",
    required: true
  },
];

/** 체크리스트 정의를 프롬프트에 넣기 좋은 문자열로 변환. */
export function checklistToText(): string {
  return CHECKLIST.map((c) => {
    const tag = c.required ? "[필수]" : "[선택]";
    return `- ${tag} ${c.key}: ${c.label}`;
  }).join("\n");
}
