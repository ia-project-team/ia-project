// 체크리스트 항목 정의. 도메인이 바뀌면 이 목록만 교체.
// 순수 로직 — 외부 의존 없음.

export interface ChecklistItemDef {
  key: string;
  label: string;
  required: boolean;
  fallbackQuestion: string;
}

/** 전세사기 인테이크 체크리스트(16) */
export const CHECKLIST: ChecklistItemDef[] = [
  // 계약 정보(3)
  { key: "has_contract_doc",
    label: "임대차계약서 보유 여부",
    required: true,
    fallbackQuestion: "임대차 계약서는 가지고 계신가요?",
  },
  { key: "contract_start_date",
    label: "계약 시작일",
    required: true,
    fallbackQuestion: "임대차 계약 시작일은 언제인가요?",
  },
  { key: "contract_end_date",
    label: "계약 종료일",
    required: true,
    fallbackQuestion: "임대차 계약 종료일은 언제인가요?",
  },
  // 금전 정보(2)
  { key: "deposit_amount", 
    label: "보증금 액수",
    required: true,
    fallbackQuestion: "임대차 보증금은 얼마인가요?",
  },
  { key: "unreturned_amount",
    label: "미반환 금액",
    required: true,
    fallbackQuestion: "아직 돌려받지 못한 보증금은 얼마인가요?",
  },
  // 거주 정보(3)
  { key: "has_resident_reg",
    label: "전입신고 여부",
    required: true,
    fallbackQuestion: "현재 주택에 전입신고를 하셨나요?",
  },
  { key: "has_fixed_date",
    label: "확정일자 여부",
    required: true,
    fallbackQuestion: "임대차 계약서에 확정일자를 받으셨나요?",
  },
  { key: "has_moved_out",
    label: "실제 퇴거 여부",
    required: true,
    fallbackQuestion: "현재 해당 주택에서 퇴거하신 상태인가요?",
  },
  // 통보 정보(3)
  { key: "notice_date",
    label: "계약 종료 통보 시점",
    required: true,
    fallbackQuestion: "임대인에게 계약 종료를 언제 통보하셨나요?",
  },
  { key: "notice_method",
    label: "통보 방식",
    required: true,
    fallbackQuestion: "계약 종료 의사는 어떤 방법으로 통보하셨나요?",
  },
  { key: "landlord_responded",
    label: "임대인 답변 여부",
    required: false,
    fallbackQuestion: "계약 종료 통보에 임대인이 답변했나요?",
  },
  // 증거 자료(3)
  { key: "has_kakao_records",
    label: "카카오톡/문자 내역",
    required: false,
    fallbackQuestion: "임대인과 주고받은 카카오톡이나 문자 내역이 있나요?",
  },
  { key: "has_certified_mail",
    label: "내용증명 여부",
    required: false,
    fallbackQuestion: "임대인에게 내용증명을 보낸 적이 있나요?",
  },
  { key: "has_transfer_records",
    label: "계좌이체 내역",
    required: false,
    fallbackQuestion: "보증금을 송금한 계좌이체 내역이 있나요?",
  },
  // 권리 보전(1)
  { key: "has_lien_registration",
    label: "임차권등기명령 신청 여부",
    required: false,
    fallbackQuestion: "임차권등기명령을 신청하셨나요?",
  },
  // 추가 위험 요소(1)
  { 
    key: "registry_check", 
    label: "등기부 선순위 권리",
    required: true,
    fallbackQuestion: "등기부등본에서 선순위 권리가 있는지 확인하셨나요?",
  },
];

/** 모델의 질문을 사용할 수 없을 때 보여줄 대표 질문을 반환한다. */
export function getFallbackQuestion(key: string): string {
  const item = CHECKLIST.find((candidate) => candidate.key === key);
  if (!item) throw new Error(`Unknown checklist key: ${key}`);
  return item.fallbackQuestion;
}

/** 체크리스트 정의를 프롬프트에 넣기 좋은 문자열로 변환. */
export function checklistToText(): string {
  return CHECKLIST.map((c) => {
    const tag = c.required ? "[필수]" : "[선택]";
    return `- ${tag} ${c.key}: ${c.label}`;
  }).join("\n");
}
