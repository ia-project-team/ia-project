---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — over_explaining × medium)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-018
case_title: "이웃 갈등 정황에 묻힌 분당 보증금 미반환"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: over_explaining
difficulty: medium
move_out_status: living_in_property
notice_method: [phone, email]
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
  - contract_start_date
  - notice_date
  - kakao_records
  - certified_mail
  - leasehold_registration
  - registry_not_checked

# --- 4. 카운트 ---
hidden_info_count: 9
expected_ia_turns: 11

# --- 5. 페르소나 ---
persona:
  name: "문정아"
  age: 52
  occupation: "프리랜서 번역가"
  residence_history: "경기 성남시 분당구 아파트 전세 2년 거주"
  current_situation: "계약 종료 후 보증금 2억원 전액 미반환으로 계속 거주 중. 층간소음·이웃 갈등 이야기를 길게 섞어 핵심 사실이 묻힘"

# --- 6. 첫 발화 ---
first_utterance: |
  계약서는 갖고 있는데, 제가 원래 조용히 사는 편이라 윗집 소음 문제도 관리사무소에 몇 번 말했거든요.
  그런데 정작 집주인은 보증금 2억을 아직 안 돌려주고 있어요.
  작년 11월 말에 계약이 끝났는데 아직 이 집에 있고요.
  처음에는 통화로 얘기했고 나중에는 이메일도 보냈는데, 집주인은 정리 중이라고만 했어요.
  이웃 문제까지 겹치니까 너무 정신이 없어서요.

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
    value: 200000000
    unit: KRW
    detail: "2억원"
  unreturned_amount:
    value: 200000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2023-12-02 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-12-01 확정일자 부여"
  has_moved_out:
    value: false
    detail: "보증금 문제로 계속 거주 중"
  notice_date:
    value: "2025-09-20"
    detail: "전화로 최초 통보, 10월 중 이메일 추가 발송"
  notice_method:
    value: [phone, email]
    detail: "전화 후 이메일. 이웃 갈등 정황과 섞여 통보 정보가 산만함"
  landlord_responded:
    value: true
    detail: "'정리 중'이라고만 답변"
  has_kakao_records:
    value: false
    detail: "카톡·문자 사용 안 함"
  has_certified_mail:
    value: false
    detail: "내용증명 발송 안 함"
  has_transfer_records:
    value: true
    detail: "보증금 입금 이체 내역 보유"
  has_lien_registration:
    value: false
    detail: "계속 거주 중이라 신청 안 함"
  registry_check:
    value: false
    detail: "등기부등본 확인 안 함"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: medium
    amount_precision: medium
    emotion_level: medium
    uncertainty_phrases:
      - "아 그게 그러니까..."
      - "말이 좀 길어지는데..."
      - "그 무렵이었어요."
      - "정확히는 자료를 봐야 해요."
  proactive_speech_pool:
    - "관리사무소랑도 이야기가 많았어요."
    - "집 문제가 한꺼번에 겹쳐서 머리가 복잡해요."
    - "번역 마감까지 있어서 제대로 정리가 안 됐어요."
    - "저는 조용히 해결하고 싶었어요."
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 이웃 갈등 정황에 묻힌 분당 보증금 미반환

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 문정아 (52세)
- **직업**: 프리랜서 번역가
- **거주 이력**: 경기 성남시 분당구 아파트 전세 2년 거주
- **현재 상황**: 보증금 2억원 전액 미반환으로 계속 거주 중. 이웃 갈등 이야기가 핵심 사실을 가림

### 이 케이스의 특징

- **`over_explaining × medium` 첫 표본**: 산만하지만 첫 발화에 7개 슬롯이 드러남
- **이웃 갈등 잡음**: 실제 GT와 무관한 층간소음·관리사무소 이야기가 길게 섞임
- **전화+이메일 다중 통보**: 기존 다중 조합과 다른 채널 구성
- **living_in_property 추가**: 보증금 미반환으로 계속 거주 중
- **v1 순수 케이스**: `issue_tags: []`

### first_utterance에서 드러나는 정보 (7개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_contract_doc` | "계약서는 갖고 있는데" |
| `contract_end_date` | "작년 11월 말" |
| `deposit_amount` | "2억" |
| `unreturned_amount` | "안 돌려주고" |
| `has_moved_out` | "아직 이 집에 있고요" |
| `notice_method` | "통화... 이메일" |
| `landlord_responded` | "정리 중이라고만" |

→ hidden = 16 - 7 = **9** → `medium`

### 질문받아야 드러나는 정보

계약서, 계약 시작일, 전입신고·확정일자, 정확한 통보일, 카톡 기록 부재, 내용증명, 이체 내역, 임차권등기, 등기부 확인.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 주요 7개 슬롯

### Turn 1 — 잡음 정리 후 계약 정보

> **AI**: 이웃 갈등과 별도로 임대차계약서와 계약 시작일을 확인할게요.
>
> **의뢰인**: 계약서는 있고 2023년 12월 1일부터였어요.

수집: `has_contract_doc`, `contract_start_date`

### Turn 2~9 — 체크리스트 순차 수집

전입신고·확정일자, 정확한 통보일, 카톡 기록 부재, 내용증명 미발송, 이체 내역, 임차권등기 미신청, 등기부 미확인을 확인한다.

### Turn 10 — 수집 완료 확인

> **의뢰인**: "지금 생각나는 건 없어요"

## 3. 변환/설계 메모

1. **잡음 속 신호 추출**: 이웃 갈등은 평가 슬롯과 무관하므로 IA가 따라가지 않아야 함.
2. **다중 채널 확대**: phone+email 조합으로 통보 매트릭스 다양화.
3. **over_explaining medium 표본**: 012 low보다 숨김이 많고 008 high보다 정보량이 많음.
4. **부차 분포 기여**: living_in_property와 다중 통보 추가.
