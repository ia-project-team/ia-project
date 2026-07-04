---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — fragmented × medium_high)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-023
case_title: "이사 결정 미확정 택시기사 - 명시 질문 필수"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: fragmented
difficulty: medium_high
move_out_status: unknown
notice_method: [kakao]
evidence_items:
  - contract_doc
  - kakao_records
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
  - contract_end_date
  - deposit_amount
  - notice_date
  - certified_mail
  - leasehold_registration
  - registry_not_checked

# --- 4. 카운트 ---
hidden_info_count: 13
expected_ia_turns: 13

# --- 5. 페르소나 ---
persona:
  name: "장태호"
  age: 41
  occupation: "택시기사"
  residence_history: "울산 남구 오피스텔 전세 2년 거주"
  current_situation: "보증금 5천 5백만원 전액 미반환. 카톡 답장은 받았으나 반환 없음. 영업 일정과 가족 사정 때문에 이사 여부를 아직 정하지 못함"

# --- 6. 첫 발화 ---
first_utterance: |
  보증금 안 줍니다.
  나갈지는 아직 몰라요.
  카톡 답장은 왔습니다.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2024-06-01"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2026-05-31"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 55000000
    unit: KRW
    detail: "5천 5백만원"
  unreturned_amount:
    value: 55000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2024-06-03 전입신고"
  has_fixed_date:
    value: true
    detail: "2024-06-01 확정일자 부여"
  has_moved_out:
    value: false
    detail: "아직 거주 중이나 이사 여부 미정"
  notice_date:
    value: "2026-04-20"
    detail: "카톡으로 반환 요청"
  notice_method:
    value: [kakao]
    detail: "카톡 단독 통보"
  landlord_responded:
    value: true
    detail: "'기다려달라'는 답장"
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
    detail: "이사 여부 미정이라 신청 안 함"
  registry_check:
    value: false
    detail: "등기부등본 확인 안 함"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: high
    amount_precision: high
    emotion_level: low
    uncertainty_phrases:
      - "네."
      - "아니요."
      - "몰라요."
      - "정하지 않았습니다."
  proactive_speech_pool:
    - "운전 중이라 길게 못 씁니다."
    - "물어보시면 답하겠습니다."
    - "말한 그대로입니다."
    - "추가로는 없어요."
  open_question_response: "없어요."
---

# 시나리오 — 이사 결정 미확정 택시기사 명시 질문 필수

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 장태호 (41세)
- **직업**: 택시기사
- **거주 이력**: 울산 남구 오피스텔 전세 2년 거주
- **현재 상황**: 카톡 답장은 받았으나 반환 없음. 이사 여부 미정

### 이 케이스의 특징

- **`fragmented × medium_high` 두 번째 표본**: 022는 퇴거 완료, 023은 unknown 이동 상태
- **슬롯별 명시 질문 필수**: 첫 발화는 통보 채널·답변·이동 상태만 암시
- **울산 남구 신규 지역**
- **계속 거주 중이나 status unknown**: `has_moved_out=false`, `move_out_status=unknown`
- **v1 순수 케이스**

### first_utterance에서 드러나는 정보 (3개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_moved_out` | "나갈지는 아직 몰라요" → 아직 안 나감 |
| `notice_method` | "카톡" |
| `landlord_responded` | "답장은 왔습니다" |

→ hidden = 16 - 3 = **13** → `medium_high`

### 질문받아야 드러나는 정보

계약서, 계약 기간, 금액, 전입신고·확정일자, 통보일, 카톡 기록, 내용증명, 이체 내역, 임차권등기, 등기부 확인.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 3개 슬롯

### Turn 1~11 — 슬롯별 명시 질문

의뢰인은 묻는 항목에만 짧게 답한다. IA가 계약서, 날짜, 금액, 증거, 권리보전, 등기부를 빠짐없이 물어야 한다.

### Turn 12 — 수집 완료 확인

> **의뢰인**: "없어요."

## 3. 변환/설계 메모

1. **022와 같은 난이도지만 이동 상태 차별**: moved_out vs unknown.
2. **fragmented 후속 답변 설계**: 자발 부연 없이 명시 질문에만 응답.
3. **부차 분포 기여**: unknown 이동 상태 추가.
4. **단일 통보 유지**: 다중 통보 목표를 넘지 않도록 kakao 단독.

