---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-06-24 (new v1 case for demo)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-007
case_title: "퇴거 후 일부 반환 미반환"
schema_version: "0.1"
created_at: "2026-06-24"
last_updated: "2026-06-24"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: fragmented
difficulty: medium
move_out_status: moved_out
notice_method: [sms]
evidence_items:
  - contract_doc
  - sms_records
  - certified_mail
  - transfer_records
  - registry_doc
evaluation_purpose:
  - golden_set_v1
  - checklist_recall
  - single_turn_comparison

# --- 3. 평가 분류 ---
# 추가 법률 쟁점 없음 (v1 순수 케이스)
issue_tags: []
# 단편형 의뢰인이 놓치기 쉬운 정보 누락 패턴
risk_missing_points:
  - contract_start_date
  - contract_end_date
  - unreturned_amount
  - leasehold_registration
  - notice_date

# --- 4. 카운트 ---
hidden_info_count: 9
expected_ia_turns: 13

# --- 5. 페르소나 ---
persona:
  name: "김도현"
  age: 35
  occupation: "IT 회사원"
  residence_history: "서울 강서구 오피스텔 전세 2년 거주 후 퇴거"
  current_situation: "보증금 1억 중 3천만원만 반환받고 나머지 7천만원을 못 받은 상태로 퇴거 완료"

# --- 6. 첫 발화 ---
first_utterance: |
  보증금 일부만 받고 못 받은 돈이 있어요.
  나머지를 안 줘요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "원본 보유"
  contract_start_date:
    value: "2023-05-01"
  contract_end_date:
    value: "2025-04-30"
  deposit_amount:
    value: 100000000
    unit: KRW
  unreturned_amount:
    value: 70000000
    unit: KRW
    detail: "전체 1억 중 3천만원은 받고 7천만원 미반환"
  has_resident_reg:
    value: true
    detail: "2023-05-02 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-05-01 확정일자"
  has_moved_out:
    value: true
    detail: "2025-05-15 퇴거 완료"
  notice_date:
    value: "2025-03-25"
  notice_method:
    value: [sms]
  landlord_responded:
    value: true
    detail: "다음달에 마저 줄게요라고 문자로 답변, 이후 미이행"
  has_kakao_records:
    value: false
    detail: "문자로만 통보, 카톡 사용 안 함"
  has_certified_mail:
    value: true
    detail: "퇴거 후 2025-05-20 발송"
  has_transfer_records:
    value: true
    detail: "처음 입금한 계좌이체 내역 + 3천만원 반환받은 입금 내역 모두 보유"
  has_lien_registration:
    value: true
    detail: "2025-05-10 퇴거 직전 신청, 등기 완료"
  registry_check:
    value: true
    detail: "확인함, 소유자 변경 없음"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: medium       # 단편형, 정확한 날짜 흐릿하게 답할 수 있음
    amount_precision: high
    emotion_level: low           # 단편형, 감정 표현 적음
    uncertainty_phrases:
      - "...같아요"
      - "정확히는..."
      - "네"
  proactive_speech_pool:
    - "이미 다 정리했어요"
    - "그냥 다음달에 준다고만 해요"
    - "더 받을 게 있는지 모르겠어요"
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 퇴거 후 일부 반환 미반환

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 김도현 (35세)
- **직업**: IT 회사원
- **거주 이력**: 서울 강서구 오피스텔 전세 2년 거주 후 퇴거
- **현재 상황**: 보증금 1억 중 3천만원만 반환받고 나머지 7천만원을 못 받은 상태로 퇴거 완료

### 이 케이스의 특징 (다른 케이스와의 차별점)

- **부분 반환 분기**: `deposit_amount`(1억) ≠ `unreturned_amount`(7천만원). 의뢰인 첫 발화에서 "일부만 받았다"는 단서만 있고 정확한 액수는 안 말함
- **퇴거 완료 후 임차권등기 신청**: `has_lien_registration: true` 케이스. 의뢰인이 절차를 잘 따랐으나 본인은 그 중요성을 인식 못 함
- **내용증명 발송함**: `has_certified_mail: true`. 다른 케이스와 다른 분기
- **단편형 페르소나**: 짧게만 답하고 보충 설명 없음. IA가 적극 캐물어야 정보가 드러남

### 의뢰인이 자발적으로 말할 정보 (= 첫 발화)

- "보증금 일부만 받고 못 받은 돈이 있어요"
- "나머지를 안 줘요"
- 정확한 액수, 계약 날짜, 임차권등기 신청 사실, 내용증명 발송 사실 등은 먼저 말하지 않음

### 질문받아야 드러나는 정보

- 정확한 보증금 액수 (1억) + 미반환 금액 (7천만원)
- 계약 시작일과 종료일
- 통보 시점과 방식
- 임차권등기명령 신청 사실
- 내용증명 발송 사실
- 등기부등본 확인 사실
- 전입신고/확정일자 시점

---

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: 보증금 일부만 받고 못 받은 돈이 있어요. 나머지를 안 줘요.

### Turn 1 — 계약서

> **AI**: 임대차계약서를 갖고 계신가요?
>
> **의뢰인**: 네, 있어요.

수집: `has_contract_doc` = true

### Turn 2 — 보증금 정확한 액수

> **AI**: 보증금은 총 얼마이고, 일부만 반환받았다고 하셨는데 정확히 얼마를 받으셨고 얼마가 남아 있나요?
>
> **의뢰인**: 보증금은 1억이었고, 3천만원만 받았어요. 7천만원이 남았어요.

수집: `deposit_amount` = 100,000,000, `unreturned_amount` = 70,000,000

### Turn 3 — 계약 시점

> **AI**: 계약 시작일과 종료일은 언제인가요?
>
> **의뢰인**: 2023년 5월쯤 시작했고 올해 4월 말에 끝났어요.

수집: `contract_start_date` = 2023-05-01, `contract_end_date` = 2025-04-30

### Turn 4~9 (생략) — 전입신고, 확정일자, 퇴거 시점, 통보, 답변, 문자 기록, 계좌이체

각 슬롯 순차 수집. 단편형이라 단답으로 답함.

### Turn 10 — 임차권등기명령 (이 케이스 핵심)

> **AI**: 퇴거 전에 혹시 임차권등기명령을 신청하셨나요?
>
> **의뢰인**: 아 네, 그건 했어요. 이사 나가기 며칠 전에요.

수집: `has_lien_registration` = true

*(비고: 의뢰인이 단편형이라 임차권등기 신청 사실을 처음엔 안 말함. IA가 명시적으로 물어야 드러남)*

### Turn 11 — 내용증명

> **AI**: 나머지 보증금을 받기 위해 내용증명을 보내신 적이 있나요?
>
> **의뢰인**: 네, 이사 나오고 며칠 후에 보냈어요.

수집: `has_certified_mail` = true

### Turn 12 — 등기부등본

> **AI**: 최근 등기부등본을 확인하셨나요?
>
> **의뢰인**: 네, 임차권등기명령 받기 전에 확인했어요.

수집: `registry_check` = true

### Turn 13 — 수집 완료 확인

> **AI**: 말씀해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 남기실 내용이 있나요?
>
> **의뢰인**: *(엄격+범위좁힘 규칙: `open_question_response`)*
>
> "지금 생각나는 건 없어요"

### 대화 종료 조건

- 체크리스트 16개 항목 전부 수집 완료
- 추가 법률 쟁점 없음 (v1 순수)
- 총 13턴 예상

---

## 3. 변환/설계 메모

1. **부분 반환 표현**: `unreturned_amount`(7천만원)이 `deposit_amount`(1억)보다 작음. 평가 시 두 값의 차이가 "실제 반환된 금액"이라는 추론이 필요. Code Evaluator가 두 값을 별도 슬롯으로 정확 매칭하는지 검증 필요.

2. **이중 계좌이체 내역**: `has_transfer_records` value는 true(있음)지만, 실제로는 입금 이체 + 3천만원 부분 반환 이체 둘 다 있음. detail에 명시. Evaluator는 boolean만 비교하므로 영향 없음.

3. **단편형 시뮬레이터 튜닝**: `proactive_speech_pool`을 의도적으로 짧고 모호한 발화로 구성. GT 슬롯 정보는 일절 포함 안 됨 (엄격 규칙 준수).

4. **v1 순수 케이스 확보**: `issue_tags: []`로 RAG 없는 v1 평가에 적합. 데모 시 IA가 체크리스트 16개를 빠짐없이 수집하는지가 핵심 측정 대상.
