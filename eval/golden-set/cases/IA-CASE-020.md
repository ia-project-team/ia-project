---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — emotional × medium_high)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-020
case_title: "등기부 근저당 발견 후 불안해진 약사"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: emotional
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
hidden_info_count: 12
expected_ia_turns: 13

# --- 5. 페르소나 ---
persona:
  name: "이서현"
  age: 34
  occupation: "약사"
  residence_history: "경기 용인시 수지구 아파트 전세 2년 거주"
  current_situation: "계약 종료 후 보증금 2억 2천만원 전액 미반환. 집주인이 카톡을 읽고도 답하지 않고, 등기부등본에서 새로운 근저당을 본 뒤 불안이 커진 상태"

# --- 6. 첫 발화 ---
first_utterance: |
  집주인이 갑자기 연락도 안 되고 등기부에 뭐가 새로 생긴 것 같아서 너무 무서워요.
  보증금도 못 받고 아직 집에 살고 있어요.
  카톡은 보냈는데 답이 없어요. 이거 위험한 거 아닌가요?

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2023-09-01"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2025-08-31"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 220000000
    unit: KRW
    detail: "2억 2천만원"
  unreturned_amount:
    value: 220000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2023-09-02 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-09-01 확정일자 부여"
  has_moved_out:
    value: false
    detail: "보증금 미반환으로 계속 거주 중"
  notice_date:
    value: "2025-07-01"
    detail: "카톡으로 최초 반환 요청"
  notice_method:
    value: [kakao]
    detail: "카톡 단독 통보"
  landlord_responded:
    value: false
    detail: "읽음 표시는 있으나 답변 없음"
  has_kakao_records:
    value: true
    detail: "카톡 캡처 보관"
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
    detail: "등기부등본 확인. 계약 후 새 근저당이 추가된 것으로 보여 불안해함"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: medium
    amount_precision: medium
    emotion_level: high
    uncertainty_phrases:
      - "하..."
      - "정확히는 기억이 잘 안 나는데..."
      - "너무 불안해서요."
      - "그게 언제였더라..."
  proactive_speech_pool:
    - "밤마다 이 생각만 나서 잠을 잘 못 자요."
    - "전문 용어가 너무 무서워 보여요."
    - "직장에서도 계속 신경이 쓰여요."
    - "부모님께 말하면 더 걱정하실까 봐 혼자 보고 있어요."
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 등기부 근저당 발견 후 불안해진 약사

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 이서현 (34세)
- **직업**: 약사
- **거주 이력**: 경기 용인시 수지구 아파트 전세 2년 거주
- **현재 상황**: 보증금 2억 2천만원 전액 미반환. 등기부상 새 근저당으로 불안 고조

### 이 케이스의 특징

- **`emotional × medium_high` 첫 진입**: 감정 호소가 강하고 구체값 대부분 숨김
- **근저당 급증 발견 정황**: `registry_check: true`이나 세부 판단은 불안 중심
- **무응답 분기**: 카톡 읽음 이후 답변 없음
- **living_in_property 추가**: 보증금 문제로 계속 거주 중
- **v1 순수 케이스**: 근저당은 `risk_missing_points`로만 표시

### first_utterance에서 드러나는 정보 (4개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_moved_out` | "아직 집에 살고 있어요" |
| `notice_method` | "카톡은 보냈는데" |
| `landlord_responded` | "답이 없어요" |
| `registry_check` | "등기부에 뭐가 새로 생긴 것 같아서" |

→ hidden = 16 - 4 = **12** → `medium_high`

### 질문받아야 드러나는 정보

계약서, 계약 기간, 보증금·미반환 금액, 전입신고·확정일자, 통보일, 카톡 기록, 내용증명, 이체 내역, 임차권등기.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 4개 슬롯

### Turn 1 — 감정 인정 후 금액 확인

> **AI**: 많이 불안하실 것 같아요. 먼저 보증금 총액과 못 받은 금액을 확인할게요.
>
> **의뢰인**: 보증금은 2억 2천이고 하나도 못 받았어요.

수집: `deposit_amount`, `unreturned_amount`

### Turn 2~11 — 체크리스트 순차 수집

계약 기간, 전입신고·확정일자, 통보일, 증거자료, 내용증명, 이체 내역, 임차권등기 여부를 확인한다.

### Turn 12 — 수집 완료 확인

> **의뢰인**: "지금 생각나는 건 없어요"

## 3. 변환/설계 메모

1. **020은 emotional 신규 정황**: 002·006·013의 지연·무응답과 달리 등기부 확인으로 불안이 촉발됨.
2. **registry_check true의 감정형 발현**: 확인은 했지만 해석은 불안 중심.
3. **medium_high 카운트**: 첫 발화 4개만 노출.
4. **부차 분포 기여**: living_in_property, 단일 통보, landlord_responded false 추가.

