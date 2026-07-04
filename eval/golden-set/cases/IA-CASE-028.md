---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — over_explaining × medium_high)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-028
case_title: "가게·가족 잡음 다층형 보증금 미반환"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: over_explaining
difficulty: medium_high
move_out_status: moving_out_planned
notice_method: [phone, email]
evidence_items:
  - contract_doc
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
  - kakao_records
  - certified_mail
  - leasehold_registration

# --- 4. 카운트 ---
hidden_info_count: 13
expected_ia_turns: 13

# --- 5. 페르소나 ---
persona:
  name: "오상훈"
  age: 57
  occupation: "프랜차이즈 매장 점주"
  residence_history: "충북 청주시 흥덕구 빌라 전세 2년 거주"
  current_situation: "보증금 7천 5백만원 전액 미반환. 가게 재계약, 부모님 병원, 자녀 취업 이야기가 섞여 핵심 사실이 늦게 드러남"

# --- 6. 첫 발화 ---
first_utterance: |
  가게 재계약이랑 가족 일까지 겹쳐서 머리가 너무 복잡해요.
  집주인이 정리 중이라고 해서 기다렸는데 보증금이 안 들어와요.
  저는 나갈 준비 중이고 통화도 하고 이메일도 보냈어요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2024-02-01"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2026-01-31"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 75000000
    unit: KRW
    detail: "7천 5백만원"
  unreturned_amount:
    value: 75000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2024-02-02 전입신고"
  has_fixed_date:
    value: true
    detail: "2024-02-01 확정일자 부여"
  has_moved_out:
    value: false
    detail: "나갈 준비 중이나 아직 거주 중"
  notice_date:
    value: "2025-12-15"
    detail: "전화로 최초 통보, 이후 이메일 발송"
  notice_method:
    value: [phone, email]
    detail: "전화 후 이메일"
  landlord_responded:
    value: true
    detail: "'정리 중'이라고 답변"
  has_kakao_records:
    value: false
    detail: "카톡 사용 안 함"
  has_certified_mail:
    value: false
    detail: "내용증명 발송 안 함"
  has_transfer_records:
    value: true
    detail: "보증금 입금 이체 내역 보유"
  has_lien_registration:
    value: false
    detail: "아직 퇴거 전이라 신청 안 함"
  registry_check:
    value: true
    detail: "등기부등본 확인. 소유자 변경 없음"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: medium
    amount_precision: medium
    emotion_level: medium
    uncertainty_phrases:
      - "아 그게 그러니까..."
      - "가게 일이랑 겹쳐서요."
      - "이야기가 좀 긴데..."
      - "정확히는 서류를 봐야 해요."
  proactive_speech_pool:
    - "매장 재계약이랑 집 문제가 같이 터졌어요."
    - "부모님 병원 일정도 있어서 정신이 없습니다."
    - "아이 취업 준비까지 겹쳐서 가족들이 다 예민해요."
    - "하나씩 정리하려고 하는데 자꾸 이야기가 새네요."
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 가게·가족 잡음 다층형 보증금 미반환

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 오상훈 (57세)
- **직업**: 프랜차이즈 매장 점주
- **거주 이력**: 충북 청주시 흥덕구 빌라 전세 2년 거주
- **현재 상황**: 가게·가족 문제가 겹쳐 핵심 사실이 산만하게 드러남

### 이 케이스의 특징

- **`over_explaining × medium_high` 두 번째 표본**: 027은 정보탐색 잡음, 028은 생활사 잡음
- **잡음 다층**: 가게 재계약, 부모님 병원, 자녀 취업이 모두 섞임
- **phone+email 다중 통보**: 018과 같은 조합이나 difficulty와 정황이 다름
- **moving_out_planned 추가**
- **v1 순수 케이스**

### first_utterance에서 드러나는 정보 (3개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_moved_out` | "나갈 준비 중" |
| `notice_method` | "통화... 이메일" |
| `landlord_responded` | "정리 중이라고" |

→ hidden = 16 - 3 = **13** → `medium_high`

### 질문받아야 드러나는 정보

계약서, 계약 기간, 금액, 전입신고·확정일자, 통보일, 카톡 기록 부재, 내용증명, 이체 내역, 임차권등기, 등기부 확인.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 3개 슬롯

### Turn 1~11 — 잡음 필터링과 체크리스트 수집

IA는 가족·가게 정황을 공감하되 계약·금액·통보·증거·권리보전 슬롯을 순서대로 묻는다.

### Turn 12 — 수집 완료 확인

> **의뢰인**: "지금 생각나는 건 없어요"

## 3. 변환/설계 메모

1. **잡음 다층 힌트 반영**: 생활사 여러 층이 하나의 발화에 섞임.
2. **over_explaining medium_high 완성**: 027·028로 두 칸 채움.
3. **부차 분포 기여**: moving_out_planned와 다중 통보 추가.
4. **첫 발화 금액 숨김**: 보증금 액수는 후속 질문으로만 드러남.

