---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-06-21 (frontmatter conversion from notion)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-003
case_title: "묵시적 갱신 여부가 불명확한 보증금 미반환"
schema_version: "0.1"
created_at: "2026-06-16"
last_updated: "2026-06-21"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: fragmented
difficulty: medium
move_out_status: living_in_property
notice_method: [phone]
evidence_items:
  - contract_doc
  - transfer_records
evaluation_purpose:
  - golden_set_v2
  - issue_detection
  - checklist_recall
  - single_turn_comparison

# --- 3. 평가 분류 ---
issue_tags:
  - implied_renewal
  - weak_notice_evidence
risk_missing_points:
  - notice_date
  - notice_method
  - call_recording
  - kakao_records
  - certified_mail
  - registry_not_checked

# --- 4. 카운트 ---
hidden_info_count: 7
expected_ia_turns: 14

# --- 5. 페르소나 ---
persona:
  name: "박준호"
  age: 34
  occupation: "프리랜서 디자이너"
  residence_history: "서울 관악구 원룸 월세 2년 거주"
  current_situation: "계약이 끝났다고 생각하고 보증금을 요구했으나, 집주인이 계약이 자동으로 연장된 것 아니냐고 주장"

# --- 6. 첫 발화 ---
first_utterance: |
  계약 끝난 줄 알고 보증금 달라고 했는데 집주인이 자동으로 연장된 거 아니냐고 해요.
  저는 그런 줄 몰랐거든요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
  contract_start_date:
    value: "2023-06-15"
  contract_end_date:
    value: "2025-06-14"
  deposit_amount:
    value: 20000000
    unit: KRW
  unreturned_amount:
    value: 20000000
    unit: KRW
  has_resident_reg:
    value: true
  has_fixed_date:
    value: true
  has_moved_out:
    value: false
    detail: "보증금 반환 받기 전 퇴거 못 함"
  notice_date:
    value: "2025-05-20"
  notice_method:
    value: [phone]
  landlord_responded:
    value: true
    detail: "이미 자동으로 연장된 거 아니냐고 답변 (묵시적 갱신 주장)"
  has_kakao_records:
    value: false
    detail: "전화로만 통보, 카톡/문자 기록 없음"
  has_certified_mail:
    value: false
  has_transfer_records:
    value: true
  has_lien_registration:
    value: false
  registry_check:
    value: false

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: high
    amount_precision: high
    emotion_level: low
    uncertainty_phrases:
      - "그게 문제인지 몰랐어요"
      - "잘 모르겠어요"
  proactive_speech_pool:
    - "제가 뭘 잘못 알고 있는 건지 모르겠어요"
    - "그냥 전화로만 말했는데 그게 문제인가요"
    - "집주인이 자꾸 자동 연장이라고 우겨요"
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 묵시적 갱신 여부가 불명확한 보증금 미반환

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 박준호 (34세)
- **직업**: 프리랜서 디자이너
- **거주 이력**: 서울 관악구 원룸 월세 2년 거주
- **현재 상황**: 계약이 끝났다고 생각하고 보증금을 요구했으나, 집주인이 계약이 자동으로 연장된 것 아니냐고 주장

### 의뢰인이 자발적으로 말할 정보 (= 첫 발화 영역)

- "계약 끝난 줄 알았는데 집주인이 자동 연장됐다고 해요"
- "보증금을 안 줘요"
- "제가 뭘 잘못 알고 있는 건지 모르겠어요"
- 계약 날짜, 통보일, 통보 방식, 증거자료 여부는 먼저 말하지 않음

### 질문받아야 드러나는 정보

- 계약 시작일과 종료일
- 계약 종료 의사 통보일
- 통보 방식이 전화뿐이었다는 점
- 집주인의 구체적인 답변
- 통화 녹음이나 문자 기록이 없다는 점
- 내용증명을 보내지 않았다는 점
- 등기부등본 확인 여부

---

## 2. IA 기대 시나리오 (참고용)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: 계약 끝난 줄 알고 보증금 달라고 했는데 집주인이 자동으로 연장된 거 아니냐고 해요. 저는 그런 줄 몰랐거든요.

### Turn 1
> **AI**: 상황이 혼란스러우실 수 있어요. 먼저 계약 내용을 기준으로 사실관계를 정리해볼게요. 임대차계약서를 갖고 계신가요?
>
> **의뢰인**: 네, 계약서 있어요.

수집: `has_contract_doc` = true

### Turn 2
> **AI**: 계약서에 적힌 계약 시작일과 종료일이 언제인가요?
>
> **의뢰인**: 2023년 6월 15일부터 2025년 6월 14일까지예요.

수집: `contract_start_date` = 2023-06-15, `contract_end_date` = 2025-06-14

### Turn 3
> **AI**: 보증금과 월세 조건은 어떻게 되어 있나요? 지금 돌려받지 못한 금액은 얼마인가요?
>
> **의뢰인**: 보증금은 2천만 원이고 월세는 60만 원이에요. 보증금 2천만 원을 아직 못 받았어요.

수집: `deposit_amount` = 20,000,000, `unreturned_amount` = 20,000,000

### Turn 4
> **AI**: 전입신고와 확정일자는 갖추셨나요?
>
> **의뢰인**: 네, 둘 다 했어요. 정확한 날짜는 계약 직후였던 것 같아요.

수집: `has_resident_reg` = true, `has_fixed_date` = true

### Turn 5
> **AI**: 현재 해당 집에서 이미 이사 나오셨나요?
>
> **의뢰인**: 아니요. 아직 살고 있어요. 보증금을 받아야 나갈 수 있어서요.

수집: `has_moved_out` = false

### Turn 6
> **AI**: 집주인에게 계약을 끝내고 나가겠다는 의사를 언제, 어떤 방식으로 전달하셨나요?
>
> **의뢰인**: 5월 20일쯤 전화로 말했어요. 계약 끝나면 나가겠다고요.

수집: `notice_date` = 2025-05-20, `notice_method` = phone

### Turn 7
> **AI**: 그때 집주인은 뭐라고 답변했나요?
>
> **의뢰인**: 나중에 보증금 얘기하니까 "이미 자동으로 연장된 거 아니냐"고 하더라고요.

수집: `landlord_responded` = true

### Turn 8
> **AI**: 전화 통화 내용이 녹음되어 있거나, 같은 내용을 문자나 카카오톡으로 주고받은 기록이 있나요?
>
> **의뢰인**: 아니요. 전화로만 얘기했고 녹음도 안 했어요.

수집: `has_kakao_records` = false

### Turn 9
> **AI**: 내용증명 우편으로 계약 종료나 보증금 반환 요청을 보낸 적은 있나요?
>
> **의뢰인**: 아니요. 그런 건 안 보냈어요.

수집: `has_certified_mail` = false

### Turn 10
> **AI**: 처음 보증금을 입금한 계좌이체 내역은 남아 있나요?
>
> **의뢰인**: 네, 이체 내역은 있어요.

수집: `has_transfer_records` = true

### Turn 11
> **AI**: 임차권등기명령을 신청하신 적이 있나요?
>
> **의뢰인**: 아니요. 아직 집에 살고 있고, 그건 뭔지도 잘 몰라요.

수집: `has_lien_registration` = false

### Turn 12
> **AI**: 최근 등기부등본을 확인해보신 적이 있나요?
>
> **의뢰인**: 아니요. 확인해본 적 없어요.

수집: `registry_check` = false

### Turn 13 — 추가 쟁점 탐지 (묵시적 갱신, v2 RAG 필요)

> **AI**: 한 가지 추가로 확인할게요. 계약 종료 전에 계약을 연장하지 않겠다는 의사를 전화 말고 문자, 카카오톡, 서면 등으로 남긴 기록은 전혀 없으신가요?
>
> **의뢰인**: 네. 그냥 전화로만 말했어요. 그게 문제인지 몰랐어요.

*(비고: 계약 종료 통보 시점과 방식, 집주인의 자동 연장 주장으로 인해 묵시적 갱신 여부가 추가 쟁점으로 기록됨. v1에서는 RAG 없이 이 쟁점 탐지가 어려울 수 있음)*

### Turn 14 — 수집 완료 확인

> **AI**: 현재까지 말씀해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 말씀하고 싶은 내용이 있나요?
>
> **의뢰인**: *(엄격+범위좁힘 규칙: `open_question_response` 사용)*
>
> "지금 생각나는 건 없어요"

### 대화 종료 조건
- 체크리스트 16개 항목 전부 수집 완료
- 추가 쟁점 1개 감지: 묵시적 갱신 여부
- 총 14턴 예상

---

## 3. 기대 리포트 (참고용)

### 사건 개요
- **사건 유형**: 보증금 반환 분쟁
- **의뢰인**: 박준호 (임차인)
- **보증금**: 2천만 원
- **현황**: 계약 종료 후 보증금 반환 요구. 집주인이 자동 연장 가능성 언급하며 반환 지연

### 확인 필요 항목

| 항목 | 이유 |
| --- | --- |
| 묵시적 갱신 여부 | 계약 종료 전 해지 의사 통보 시점/방식이 불명확하고 집주인이 자동 연장 주장 |
| 통보 증거 부족 | 전화만 있고 녹음/문자/카톡 기록 없음 |
| 내용증명 미발송 | 반환 요청 또는 종료 의사 서면 기록 없음 |
| 등기부등본 확인 필요 | 선순위 권리, 소유자 변경 여부 미확인 |

---

## 4. 변환 이슈

1. **`has_kakao_records` 슬롯명**: CASE-003은 전화 통보이며 카톡/문자 모두 없음. has_kakao_records=false로 매핑했으나 슬롯 이름이 SMS 포함하지 못함. 스키마 수정 검토 필요 (예: `has_msg_records`).
2. **`notice_method: phone` 처리**: 전화 통보는 효력 약함. risk_missing_points의 `notice_method_validity`로 표현 가능하나 enum에 없어 누락.
3. **CASE-003은 v2 평가 대상**: 묵시적 갱신은 RAG 없이 탐지 어려움. v1 평가셋에 포함 시 추가 쟁점 탐지율 점수 0 예상.
