---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — confused × high)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-029
case_title: "대부분 모른다고 답하는 배달라이더 고난도 케이스"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: confused
difficulty: high
move_out_status: living_in_property
notice_method: [unknown]
evidence_items:
  - transfer_records
evaluation_purpose:
  - golden_set
  - checklist_recall
  - single_turn_comparison

# --- 3. 평가 분류 ---
issue_tags: []
risk_missing_points:
  - contract_start_date
  - contract_end_date
  - deposit_amount
  - resident_registration
  - fixed_date
  - notice_date
  - notice_method
  - kakao_records
  - certified_mail
  - leasehold_registration
  - registry_not_checked

# --- 4. 카운트 ---
hidden_info_count: 15
expected_ia_turns: 14

# --- 5. 페르소나 ---
persona:
  name: "문성우"
  age: 25
  occupation: "배달 라이더"
  residence_history: "서울 금천구 원룸 전세 2년 거주"
  current_situation: "보증금 4천 5백만원 전액 미반환. 계약서도 찾지 못하고 통보 방식도 기억하지 못해 대부분의 슬롯을 질문받아야만 답함"

# --- 6. 첫 발화 ---
first_utterance: |
  보증금을 못 받았는데 제가 뭘 했는지 잘 모르겠어요.
  그냥 계속 살고 있어요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: false
    detail: "계약서 원본을 잃어버렸고 사진도 찾지 못함"
  contract_start_date:
    value: "2024-05-01"
    detail: "기억이 흐릿하나 실제 계약 시작일"
  contract_end_date:
    value: "2026-04-30"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 45000000
    unit: KRW
    detail: "4천 5백만원"
  unreturned_amount:
    value: 45000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2024-05-03 전입신고는 했으나 본인은 절차 의미를 모름"
  has_fixed_date:
    value: false
    detail: "확정일자 부여 안 받음"
  has_moved_out:
    value: false
    detail: "보증금 미반환으로 계속 거주 중"
  notice_date:
    value: "2026-04-15"
    detail: "계약 만료 직전 연락한 것으로 추정되나 본인은 방식·상대방을 혼동"
  notice_method:
    value: [unknown]
    detail: "정확한 통보 방식 미확인. 본인은 카톡인지 전화인지 계속 헷갈림"
  landlord_responded:
    value: false
    detail: "명확한 답변 받은 적 없음"
  has_kakao_records:
    value: false
    detail: "확인 가능한 카톡·문자 기록 없음"
  has_certified_mail:
    value: false
    detail: "내용증명 발송 안 함"
  has_transfer_records:
    value: true
    detail: "보증금 입금 이체 내역은 은행 앱에 남아 있음"
  has_lien_registration:
    value: false
    detail: "임차권등기명령 제도 모름"
  registry_check:
    value: false
    detail: "등기부등본 확인 안 함"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: low
    amount_precision: low
    emotion_level: medium
    uncertainty_phrases:
      - "그게 뭐예요?"
      - "잘 모르겠어요."
      - "기억이 안 나요."
      - "아마 그랬던 것 같아요."
      - "어디서 확인해야 하는지도 모르겠어요."
  proactive_speech_pool:
    - "일이 들쭉날쭉해서 서류를 제대로 못 챙겼어요."
    - "뭘 물어보셔도 제가 바로 답을 못 할 수 있어요."
    - "이런 절차는 처음이라 너무 헷갈려요."
    - "일단 은행 앱만 볼 수 있어요."
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 대부분 모른다고 답하는 배달라이더 고난도 케이스

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 문성우 (25세)
- **직업**: 배달 라이더
- **거주 이력**: 서울 금천구 원룸 전세 2년 거주
- **현재 상황**: 계약서와 통보 방식 대부분을 기억하지 못하는 confused high 케이스

### 이 케이스의 특징

- **`confused × high` 유일 표본**: 첫 발화에서 1개 슬롯만 명확히 드러남
- **대부분 "몰라요"**: 계약서, 날짜, 통보 방식, 권리보전 절차 모두 명확화 필요
- **`notice_method: [unknown]` 두 번째 진입**: 019와 달리 본인 기억 자체가 흐림
- **living_in_property 추가**
- **v1 순수 케이스**

### first_utterance에서 드러나는 정보 (1개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_moved_out` | "계속 살고 있어요" |

→ hidden = 16 - 1 = **15** → `high`

### 질문받아야 드러나는 정보

나머지 15개 슬롯 전부. 특히 계약서 없음, 확정일자 없음, 통보 방식 미확인, 내용증명·임차권등기·등기부 미이행을 IA가 하나씩 끌어내야 한다.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): `has_moved_out`

### Turn 1~12 — 체크리스트 전 항목 명시 질문

confused 페르소나가 대부분 되묻거나 모른다고 답하므로, IA는 계약서 보유 여부부터 금액, 통보, 증거, 권리보전까지 순서대로 재질문해야 한다.

### Turn 13 — 수집 완료 확인

> **의뢰인**: "지금 생각나는 건 없어요"

## 3. 변환/설계 메모

1. **high 난이도 카운트**: hidden 15로 고난도 조건 충족.
2. **confused 발현 극대화**: 거의 모든 후속 답변에 불확실성 표현이 섞임.
3. **부차 분포 기여**: living_in_property와 unknown 통보 추가.
4. **증거 최소 케이스**: transfer_records만 true라 IA가 증거 부족을 확인해야 함.

