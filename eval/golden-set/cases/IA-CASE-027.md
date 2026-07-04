---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — over_explaining × medium_high)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-027
case_title: "부동산 카페 정보 과잉 속 보증금 미반환"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: over_explaining
difficulty: medium_high
move_out_status: living_in_property
notice_method: [kakao]
evidence_items:
  - contract_doc
  - kakao_records
  - transfer_records
  - registry_doc
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
  - notice_date
  - certified_mail
  - leasehold_registration
  - senior_mortgage

# --- 4. 카운트 ---
hidden_info_count: 13
expected_ia_turns: 13

# --- 5. 페르소나 ---
persona:
  name: "나혜진"
  age: 50
  occupation: "온라인 쇼핑몰 운영자"
  residence_history: "경기 남양주시 다산동 아파트 전세 2년 거주"
  current_situation: "보증금 2억 4천만원 전액 미반환. 부동산 카페 글을 많이 읽어 잡음이 많고, 카톡 통보와 등기부 확인 사실이 다른 정보에 묻힘"

# --- 6. 첫 발화 ---
first_utterance: |
  부동산 카페 글을 너무 많이 보다 보니 뭐가 맞는지 모르겠어요.
  집주인은 기다리라고만 하고 아직 집에 있어요.
  카페에서는 등기부부터 보라는데 제가 본 게 맞는지도 모르겠고요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2023-06-20"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2025-06-19"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 240000000
    unit: KRW
    detail: "2억 4천만원"
  unreturned_amount:
    value: 240000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2023-06-21 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-06-20 확정일자 부여"
  has_moved_out:
    value: false
    detail: "보증금 미반환으로 계속 거주 중"
  notice_date:
    value: "2025-05-10"
    detail: "카톡으로 최초 반환 요청"
  notice_method:
    value: [kakao]
    detail: "카톡 단독 통보"
  landlord_responded:
    value: true
    detail: "'기다려달라'는 답변 반복"
  has_kakao_records:
    value: true
    detail: "카톡 대화 캡처 보관"
  has_certified_mail:
    value: false
    detail: "내용증명 발송 안 함"
  has_transfer_records:
    value: true
    detail: "보증금 입금 이체 내역 보유"
  has_lien_registration:
    value: false
    detail: "아직 거주 중이라 신청 안 함"
  registry_check:
    value: true
    detail: "등기부등본 확인. 선순위 근저당처럼 보이는 항목을 보고 불안해함"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: medium
    amount_precision: medium
    emotion_level: medium
    uncertainty_phrases:
      - "아 그게 그러니까..."
      - "카페에서 본 글이랑 헷갈려서요."
      - "정확히는 자료를 봐야 해요."
      - "말이 좀 길어지는데요."
  proactive_speech_pool:
    - "인터넷 글마다 말이 달라서 더 헷갈려요."
    - "쇼핑몰 주문 처리랑 겹쳐서 정리가 안 돼요."
    - "주변에서 다 다른 이야기를 해요."
    - "제가 너무 많이 찾아본 것 같기도 해요."
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 부동산 카페 정보 과잉 속 보증금 미반환

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 나혜진 (50세)
- **직업**: 온라인 쇼핑몰 운영자
- **거주 이력**: 경기 남양주시 다산동 아파트 전세 2년 거주
- **현재 상황**: 부동산 카페 정보 과잉으로 핵심 사실이 묻힘

### 이 케이스의 특징

- **`over_explaining × medium_high` 첫 진입**: 잡음은 많지만 첫 발화의 슬롯 노출은 3개뿐
- **부동산 카페 정보 남발**: `proactive_speech_pool`에서도 GT 없는 정보 탐색 잡음 유지
- **living_in_property 추가**
- **등기부 확인 true**: 정보는 있으나 해석이 불명확
- **v1 순수 케이스**

### first_utterance에서 드러나는 정보 (3개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_moved_out` | "아직 집에 있어요" |
| `landlord_responded` | "기다리라고만" |
| `registry_check` | "등기부부터 보라는데 제가 본 게" |

→ hidden = 16 - 3 = **13** → `medium_high`

### 질문받아야 드러나는 정보

계약서, 계약 기간, 보증금·미반환 금액, 전입신고·확정일자, 통보일·방식, 카톡 기록, 내용증명, 이체 내역, 임차권등기.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 3개 슬롯

### Turn 1~11 — 잡음 필터링과 체크리스트 수집

IA는 부동산 카페 정보에 끌려가지 않고 계약·금액·통보·증거·권리보전 순서로 묻는다.

### Turn 12 — 수집 완료 확인

> **의뢰인**: "지금 생각나는 건 없어요"

## 3. 변환/설계 메모

1. **카페 정보 과잉 방향성 반영**: 힌트의 정보 남발을 GT 없는 잡음으로 구성.
2. **over_explaining medium_high**: 말은 많지만 평가 슬롯은 거의 드러나지 않음.
3. **부차 분포 기여**: living_in_property, 단일 통보.
4. **등기부 해석 불명확**: `registry_check`는 true이나 `senior_mortgage`는 risk로만 반영.

