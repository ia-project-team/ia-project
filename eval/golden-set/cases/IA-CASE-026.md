---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — avoidant × medium_high)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-026
case_title: "부동산에만 말하고 정식 통보를 피한 MD"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: avoidant
difficulty: medium_high
move_out_status: unknown
notice_method: [none]
evidence_items:
  - contract_doc
  - transfer_records
evaluation_purpose:
  - golden_set
  - checklist_recall
  - single_turn_comparison

# --- 3. 평가 분류 ---
issue_tags: []
risk_missing_points:
  - move_out_status
  - contract_start_date
  - notice_date
  - notice_method
  - notice_method_validity
  - kakao_records
  - certified_mail
  - leasehold_registration
  - registry_not_checked

# --- 4. 카운트 ---
hidden_info_count: 11
expected_ia_turns: 12

# --- 5. 페르소나 ---
persona:
  name: "한예린"
  age: 29
  occupation: "패션 MD"
  residence_history: "서울 송파구 오피스텔 전세 2년 거주"
  current_situation: "보증금 1억 7천만원 전액 미반환. 부동산 중개인에게만 대충 말하고 집주인에게 직접 정식 통보하지 않은 사실을 늦게 인정"

# --- 6. 첫 발화 ---
first_utterance: |
  보증금 1억 7천을 못 받았어요.
  부동산에는 말해뒀고 집주인에게 직접 정식으로 알린 건 없어요.
  아직 살고는 있는데 어떻게 할지 정하지 못했습니다. 집주인 답은 없어요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2023-12-01"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2025-11-30"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 170000000
    unit: KRW
    detail: "1억 7천만원"
  unreturned_amount:
    value: 170000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2023-12-03 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-12-01 확정일자 부여"
  has_moved_out:
    value: false
    detail: "아직 거주 중이나 이사 여부 미정"
  notice_date:
    value: "2025-10-01"
    detail: "부동산 중개인에게 말한 기준일. 집주인에게 직접 정식 통보한 날짜는 없음"
  notice_method:
    value: [none]
    detail: "집주인에게 직접 통보한 방식 없음. 부동산에만 구두로 말함"
  landlord_responded:
    value: false
    detail: "집주인에게 직접 답변 받은 적 없음"
  has_kakao_records:
    value: false
    detail: "집주인과 카톡·문자 기록 없음"
  has_certified_mail:
    value: false
    detail: "내용증명 발송 안 함"
  has_transfer_records:
    value: true
    detail: "보증금 입금 이체 내역 보유"
  has_lien_registration:
    value: false
    detail: "이사 여부 미정이라 신청 안 함"
  registry_check:
    value: false
    detail: "등기부등본 확인 안 함"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: low
    amount_precision: high
    emotion_level: low
    uncertainty_phrases:
      - "음..."
      - "그건 좀 애매해요."
      - "정식으로는..."
      - "사실 직접 한 건 아니에요."
  proactive_speech_pool:
    - "제가 바빠서 중간에 맡겨둔 부분이 있어요."
    - "괜히 제 책임처럼 보일까 봐 조심스럽네요."
    - "정확히 어디까지 해야 하는지 몰랐어요."
    - "좋게 정리될 줄 알았습니다."
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 부동산에만 말하고 정식 통보를 피한 MD

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 한예린 (29세)
- **직업**: 패션 MD
- **거주 이력**: 서울 송파구 오피스텔 전세 2년 거주
- **현재 상황**: 보증금 1억 7천만원 전액 미반환. 정식 통보 없음

### 이 케이스의 특징

- **`avoidant × medium_high` 두 번째 표본**: 025가 금액 회피라면 026은 통보 회피
- **`notice_method: [none]` 신규 진입**: 집주인에게 직접 통보한 방식 없음
- **move_out_status unknown**: 아직 거주 중이나 이사 여부 미정
- **부동산 중개인에게만 말함**: 016의 대행 전화와 달리 정식 통보로 보기 어려운 구성
- **v1 순수 케이스**

### first_utterance에서 드러나는 정보 (5개)

| 슬롯 | 드러남 근거 |
|---|---|
| `deposit_amount` | "1억 7천" |
| `unreturned_amount` | "못 받았어요" |
| `notice_method` | "직접 정식으로 알린 건 없어요" |
| `has_moved_out` | "아직 살고는 있는데" |
| `landlord_responded` | "답은 없어요" |

→ hidden = 16 - 5 = **11** → `medium_high`

### 질문받아야 드러나는 정보

계약서, 계약 기간, 전입신고·확정일자, 부동산에 말한 기준일, 증거 부재, 내용증명, 이체 내역, 임차권등기, 등기부 확인.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 5개 슬롯

### Turn 1 — 통보 방식 확정

> **AI**: 집주인에게 직접 카톡, 문자, 전화, 내용증명 중 어떤 방식으로 알리셨나요?
>
> **의뢰인**: 직접 한 건 없어요. 부동산에만 말했어요.

수집: `notice_method` = [none]

### Turn 2~10 — 체크리스트 순차 수집

계약 기간, 전입신고·확정일자, 기준일, 증거자료, 이체 내역, 권리보전, 등기부 확인을 묻는다.

### Turn 11 — 수집 완료 확인

> **의뢰인**: "지금 생각나는 건 없어요"

## 3. 변환/설계 메모

1. **none 어휘 도입**: 단, `notice_date`는 현재 평가 코드 호환을 위해 부동산에 말한 기준일로 둠.
2. **avoidant 본질**: 본인이 직접 통보하지 않은 불리한 사실을 축소하려 함.
3. **부차 분포 기여**: unknown 이동 상태와 단일 통보 축.
4. **향후 evaluator 주의**: `none` 정규화는 별도 보강 대상.

