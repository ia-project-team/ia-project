---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — avoidant × high)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-030
case_title: "불리 정보 다수 숨기는 퇴거 완료 판매직"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: avoidant
difficulty: high
move_out_status: moved_out
notice_method: [sms]
evidence_items:
  - contract_doc
  - sms_records
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
  - notice_method_validity
  - certified_mail
  - leasehold_registration
  - registry_not_checked

# --- 4. 카운트 ---
hidden_info_count: 15
expected_ia_turns: 14

# --- 5. 페르소나 ---
persona:
  name: "유나경"
  age: 31
  occupation: "백화점 판매직"
  residence_history: "경기 부천시 원미구 빌라 전세 2년 거주 후 퇴거"
  current_situation: "보증금 6천 5백만원 전액 미반환. 전입신고·확정일자 미이행, 임차권등기 미신청, 등기부 미확인, 종료 직전 문자 통보 등 불리한 사실을 대부분 숨김"

# --- 6. 첫 발화 ---
first_utterance: |
  보증금 때문에 상담받고 싶어요.
  이사는 나왔습니다.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 사본 보유"
  contract_start_date:
    value: "2023-07-01"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2025-06-30"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 65000000
    unit: KRW
    detail: "6천 5백만원"
  unreturned_amount:
    value: 65000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: false
    detail: "전입신고 안 함. 본인에게 불리해 직접 묻기 전까지 말하지 않음"
  has_fixed_date:
    value: false
    detail: "확정일자도 받지 않음"
  has_moved_out:
    value: true
    detail: "2025-07-20 이사 완료"
  notice_date:
    value: "2025-06-29"
    detail: "계약 종료 하루 전 문자로 뒤늦게 반환 요청"
  notice_method:
    value: [sms]
    detail: "문자 단독 통보"
  landlord_responded:
    value: true
    detail: "'알겠다'는 짧은 답변 후 반환 없음"
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
    detail: "임차권등기명령 신청 없이 퇴거"
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
      - "그건 좀..."
      - "사실은..."
      - "정확히 말하면..."
      - "제가 잘 챙기진 못했어요."
  proactive_speech_pool:
    - "제 쪽에서 놓친 게 있어서 조심스럽습니다."
    - "가능하면 크게 문제 삼고 싶진 않았어요."
    - "혼자 처리하려다 보니 빠진 게 많아요."
    - "불리하게 보일까 봐 걱정돼요."
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 불리 정보 다수 숨기는 퇴거 완료 판매직

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 유나경 (31세)
- **직업**: 백화점 판매직
- **거주 이력**: 경기 부천시 원미구 빌라 전세 2년 거주 후 퇴거
- **현재 상황**: 보증금 6천 5백만원 전액 미반환. 불리한 절차 미이행 다수

### 이 케이스의 특징

- **`avoidant × high` 유일 표본**: 첫 발화에서 퇴거 사실만 드러남
- **불리 정보 다수**: 전입신고 없음, 확정일자 없음, 임차권등기 없음, 등기부 미확인, 통보 늦음
- **극도로 짧은 첫 발화**: 힌트 그대로 2문장 구성
- **퇴거 완료 후 권리보전 미이행**
- **v1 순수 케이스**

### first_utterance에서 드러나는 정보 (1개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_moved_out` | "이사는 나왔습니다" |

→ hidden = 16 - 1 = **15** → `high`

### 질문받아야 드러나는 정보

나머지 15개 슬롯 전부. 특히 전입신고·확정일자 미이행, 늦은 통보일, 내용증명 미발송, 임차권등기 미신청, 등기부 미확인이 avoidant 핵심이다.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): `has_moved_out`

### Turn 1~12 — 불리 정보 명시 질문

IA가 보증금·계약 기간·통보뿐 아니라 전입신고, 확정일자, 임차권등기, 등기부 확인까지 직접 물어야 한다. 의뢰인은 불리 정보에서 머뭇거리며 답한다.

### Turn 13 — 수집 완료 확인

> **의뢰인**: "지금 생각나는 건 없어요"

## 3. 변환/설계 메모

1. **avoidant high 완성**: 001·004·017·025·026보다 훨씬 더 많은 불리 정보가 숨겨져 있음.
2. **힌트 전부 반영**: 확정일자 X, 임차권 X, 등기부 X, 통보 늦음이 GT에 명시됨.
3. **부차 분포 기여**: moved_out, 단일 통보.
4. **high 카운트**: hidden 15로 최상 난이도 유지.

