---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-06-21
# 이 frontmatter는 LangSmith Example 변환 스크립트의 source of truth.
# 본문(아래 마크다운)은 인간 검토용.
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-002
case_title: "단순 보증금 미반환"
schema_version: "0.1"
created_at: "2026-06-16"
last_updated: "2026-06-21"
author: "최유진"
status: draft   # draft | review | confirmed

# --- 2. 분류 메타데이터 (LangSmith metadata 로 매핑) ---
client_type: emotional                # emotional | fragmented | confused | avoidant | over_explaining
difficulty: low                       # low | medium | medium_high | high
move_out_status: living_in_property   # living_in_property | moved_out | moving_out_planned | unknown
notice_method: [kakao]
evidence_items:
  - contract_doc
  - kakao_records
  - transfer_records
evaluation_purpose:
  - golden_set_v1
  - checklist_recall
  - single_turn_comparison

# --- 3. 평가 분류: v1/v2 명확히 분리 ---
# issue_tags: v2 RAG가 탐지해야 할 법률 쟁점만 (빈 배열이면 v1용 단순 케이스)
issue_tags: []
# risk_missing_points: v1 단일턴이 놓치기 쉬운 일반 정보 누락
risk_missing_points:
  - contract_end_date
  - deposit_amount
  - resident_registration
  - fixed_date
  - move_out_status
  - notice_method
  - kakao_records
  - registry_not_checked

# --- 4. 카운트 (참고용, 평가 기준 아님) ---
hidden_info_count: 8     # 첫 발화에 안 드러나고 GT에 있는 슬롯 수 (정의 재검토 필요, 변환 이슈 #3 참조)
expected_ia_turns: 13    # 인간이 설계한 ideal 턴 수

# --- 5. 페르소나 (LangSmith inputs.persona) ---
persona:
  name: "김민지"
  age: 29
  occupation: "중소기업 마케터"
  residence_history: "서울 성북구 오피스텔 전세 2년 거주"
  current_situation: "계약 종료 후에도 보증금 1억 2천만원 미반환으로 계속 거주 중"

# --- 6. 첫 발화 / Turn 0 (LangSmith inputs.first_utterance) ---
first_utterance: |
  전세 계약이 끝났는데 집주인이 돈을 안 돌려줘요.
  계속 기다려달라고만 하는데 너무 답답해요.

# --- 7. Ground Truth: 16개 슬롯 (LangSmith outputs.ground_truth = reference) ---
# value: Code Evaluator 가 IA collected[] 와 비교하는 정답
# detail: 시뮬레이터 답변 풍부화 + 인간 검토용 (평가에는 사용 안 함)
ground_truth:
  has_contract_doc:
    value: true
    detail: "원본 계약서 보유"
  contract_start_date:
    value: "2023-04-01"
  contract_end_date:
    value: "2025-03-31"
  deposit_amount:
    value: 120000000
    unit: KRW
  unreturned_amount:
    value: 120000000
    unit: KRW
  has_resident_reg:
    value: true
    detail: "2023-04-02 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-04-01 확정일자"
  has_moved_out:
    value: false
    detail: "현재 계속 거주 중"
  notice_date:
    value: "2025-02-01"
  notice_method:
    value: [kakao]
  landlord_responded:
    value: true
    detail: "조금만 기다려달라고 카톡 답변"
  has_kakao_records:
    value: true
    detail: "캡처 보관 중"
  has_certified_mail:
    value: false
  has_transfer_records:
    value: true
    detail: "은행 앱에서 확인 가능"
  has_lien_registration:
    value: false
    detail: "신청 안 함"
  registry_check:
    value: false
    detail: "미확인"

# --- 8. 시뮬레이터 제어 (LangSmith inputs.simulator_context) ---
# 직전 결정: 엄격 + 범위 좁힘
# - GT 16개 슬롯 정보는 자발 발화 절대 금지
# - GT 외 정황/감정/맥락 발화는 proactive_speech_pool 안에서 허용
simulator:
  answer_style:
    date_precision: high       # high | medium | low
    amount_precision: high
    emotion_level: medium      # low | medium | high
    uncertainty_phrases: []    # 페르소나가 불확실하게 답할 때 섞을 표현 (없으면 빈 배열)

  proactive_speech_pool:
    # 의뢰인이 자발적으로 흘릴 수 있는 발화 풀.
    # 이 안의 어떤 항목도 GT 16개 슬롯 값을 노출하지 않음.
    - "너무 답답해요"
    - "어떻게 해야 할지 모르겠어요"
    - "집주인이 돈이 없다고만 해요"
    - "믿었는데 이런 일이 생겨서 속상해요"

  open_question_response: "지금 생각나는 건 없어요"
  # IA/baseline 이 'open question'(더 말씀하실 거?, 추가로?)을 던졌을 때 시뮬레이터 기본 답변
---

# 시나리오 — 단순 보증금 미반환

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.
> Turn-by-turn 흐름은 IA 의 *기대* 행동이며, 실제 평가 실행 시 IA 출력과 다를 수 있음.

---

## 1. 페르소나

- **이름**: 김민지 (29세)
- **직업**: 중소기업 마케터
- **거주 이력**: 서울 성북구 오피스텔 전세 2년 거주
- **현재 상황**: 계약 종료 후에도 보증금 1억 2천만원 미반환으로 계속 거주 중

### 의뢰인이 자발적으로 말할 정보 (= 첫 발화 영역)

- "전세 계약이 끝났는데 집주인이 돈을 안 돌려줘요"
- "계속 기다려달라고만 해요"
- "너무 답답해요"
- 보증금 액수는 말할 수 있으나, 계약 날짜/전입신고/확정일자/증거자료 여부는 자발적으로 말하지 않음

### 질문받아야 드러나는 정보 (= 시뮬레이터가 질문받았을 때만 답할 정보)

- 계약 시작일과 종료일
- 전입신고/확정일자 여부 및 시점
- 퇴거 여부
- 통보 날짜와 통보 방식
- 집주인 답변 내용
- 카카오톡 기록 보유 여부
- 내용증명 발송 여부
- 등기부등본 확인 여부

---

## 2. IA 기대 시나리오 (참고용)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: 전세 계약이 끝났는데 집주인이 돈을 안 돌려줘요. 계속 기다려달라고만 하는데 너무 답답해요.

### Turn 1

> **AI**: 많이 답답하실 것 같아요. 상담 전 상황을 정확히 정리하기 위해 몇 가지를 순서대로 확인해볼게요. 먼저 임대차계약서를 현재 갖고 계신가요?
>
> **의뢰인**: 네, 계약서 원본 가지고 있어요.

수집: `has_contract_doc` = true

### Turn 2

> **AI**: 계약서에 적힌 계약 시작일과 종료일이 언제인가요?
>
> **의뢰인**: 2023년 4월 1일부터 2025년 3월 31일까지예요.

수집: `contract_start_date` = 2023-04-01, `contract_end_date` = 2025-03-31

### Turn 3

> **AI**: 보증금은 총 얼마였고, 지금 돌려받지 못한 금액은 얼마인가요?
>
> **의뢰인**: 보증금은 1억 2천만원이고, 한 푼도 못 받았어요.

수집: `deposit_amount` = 120,000,000, `unreturned_amount` = 120,000,000

### Turn 4

> **AI**: 계약 당시 전입신고와 확정일자는 받으셨나요?
>
> **의뢰인**: 전입신고는 이사 다음 날 했고, 확정일자는 계약서 쓴 날 받았던 것 같아요.

수집: `has_resident_reg` = true, `has_fixed_date` = true

### Turn 5

> **AI**: 현재 집에서는 이미 이사 나오셨나요, 아니면 아직 거주 중이신가요?
>
> **의뢰인**: 아직 살고 있어요. 돈을 못 받아서 못 나가고 있어요.

수집: `has_moved_out` = false

### Turn 6

> **AI**: 집주인에게 계약 종료나 보증금 반환 요청을 언제, 어떤 방식으로 전달하셨나요?
>
> **의뢰인**: 2월 1일쯤 카톡으로 말했어요. 계약 끝나면 보증금 돌려달라고요.

수집: `notice_date` = 2025-02-01, `notice_method` = [kakao]

### Turn 7

> **AI**: 집주인이 그 메시지에 답변을 했나요? 했다면 어떤 내용이었나요?
>
> **의뢰인**: "조금만 기다려달라"고 했어요. 그 뒤로도 비슷한 말만 계속했어요.

수집: `landlord_responded` = true

### Turn 8

> **AI**: 그 카카오톡 대화 내역은 지금도 확인하거나 캡처해두셨나요?
>
> **의뢰인**: 네, 캡처해뒀어요.

수집: `has_kakao_records` = true

### Turn 9

> **AI**: 내용증명 우편으로 보증금 반환 요청을 보낸 적은 있으신가요?
>
> **의뢰인**: 아니요. 그런 건 아직 안 해봤어요.

수집: `has_certified_mail` = false

### Turn 10

> **AI**: 처음 보증금을 입금했을 때 계좌이체 내역은 남아 있나요?
>
> **의뢰인**: 네, 은행 앱에서 확인할 수 있어요.

수집: `has_transfer_records` = true

### Turn 11

> **AI**: 임차권등기명령을 신청하신 적이 있나요?
>
> **의뢰인**: 아니요. 아직 이사를 안 나가서 그런 건 생각도 못 했어요.

수집: `has_lien_registration` = false

### Turn 12

> **AI**: 마지막으로, 최근에 등기부등본을 확인해서 집주인 변경이나 근저당권 같은 권리관계를 보신 적이 있나요?
>
> **의뢰인**: 아니요. 등기부등본은 아직 확인 안 했어요.

수집: `registry_check` = false

### Turn 13 — 수집 완료 확인

> **AI**: 말씀해주신 내용을 바탕으로 상담 전 정리 리포트를 만들 수 있습니다. 혹시 추가로 기억나는 내용이 있나요?
>
> **의뢰인**: *(엄격+범위좁힘 규칙에 따라 시뮬레이터는 `open_question_response` 사용)*
>
> "지금 생각나는 건 없어요"

> 참고: 원본 시나리오의 Turn 13 의뢰인 발화("집주인이 돈이 없다는 말만 계속해요. 그 말도 카톡에 남아 있어요")는 GT 슬롯 정보(`has_kakao_records`)와 관련되므로 시뮬레이터 규칙상 자발 발화 불가. 위 응답으로 대체.

### 대화 종료 조건

- 필수 체크리스트 16개 항목 전부 수집 완료
- 추가 쟁점 없음 (v1 평가셋)
- 총 13턴 예상

---

## 3. 기대 리포트 (참고용)

### 사건 개요

- **사건 유형**: 전세 보증금 반환 분쟁
- **의뢰인**: 김민지 (임차인)
- **보증금**: 1억 2천만원
- **미반환 금액**: 1억 2천만원 전액
- **현황**: 계약 종료 후 보증금 미반환으로 계속 거주 중

### 시간순 사실관계

| 날짜 | 사실 |
| --- | --- |
| 2023.04.01 | 임대차계약 시작, 확정일자 수령 |
| 2023.04.02 | 전입신고 완료 |
| 2025.02.01 | 집주인에게 카카오톡으로 계약 종료 및 보증금 반환 요청 |
| 2025.03.31 | 계약 종료일 |
| 2025.06.16 | 보증금 전액 미반환, 임차인 계속 거주 중 |

### 확인 필요 항목

| 항목 | 이유 |
| --- | --- |
| 등기부등본 확인 필요 | 집주인 변경 여부, 근저당권 등 선순위 권리 확인 필요 |
| 내용증명 미발송 | 현재까지 카카오톡 외 공식적인 반환 요청 기록 없음 |
| 계속 거주 중 | 퇴거 여부와 보증금 반환 일정 정리 필요 |
| 집주인 답변 기록 | "기다려달라"는 답변이 카카오톡에 남아 있으므로 증거자료로 정리 필요 |

---

*본 리포트는 의뢰인의 진술을 바탕으로 작성된 사전 정리 자료입니다. 법률 자문이나 승소 가능성 판단을 포함하지 않습니다.*

---

## 4. 변환 이슈 (작성 중 발견)

이 케이스를 frontmatter 로 변환하면서 발견한 정의 모호함. 24개 신규 작성 전 결정 필요.

1. **노션 `issue_tags`의 "등기부 미확인", "내용증명 없음" 처리**: 직전 결정에 따라 이들은 v2 법률 쟁점이 아니라 v1 정보 누락이므로 `issue_tags`에서 제외, `risk_missing_points`로 이동. 노션 DB 옵션도 정리 필요(`issue_tags` enum 에서 이들 제거 또는 별도 카테고리 분리).

2. **노션 `issue_tags`의 "없음" enum 처리**: "없음" 단독이거나 다른 태그와 공존 불가. CASE-002 노션엔 "없음" + "등기부 미확인" + "내용증명 없음"이 같이 있는데, 본 변환에서는 `issue_tags: []`(빈 배열)로 정리. enum 에서 "없음" 옵션 자체 제거 권장 — 빈 배열이 곧 "없음".

3. **`hidden_info_count` 정의 모호**: 노션엔 8로 적혀 있으나 정의 불명. 가능한 정의 후보:
   - (a) 첫 발화에 안 드러난 GT 슬롯 수 = 약 15개 (보증금만 암시)
   - (b) 시나리오상 "질문받아야 드러나는 정보" 섹션 항목 수 = 8개
   - (c) 핵심 정보 중 안 드러난 수 = 별도 정의 필요
   - 권장: 정의 (b) 채택하되, 24개 작성 시 자동 계산 룰로 통일.

4. **Turn 13 자발 발화 처리**: 본문 시나리오와 simulator 규칙이 충돌. frontmatter 의 `open_question_response`로 시뮬레이터 행동을 명시, 본문은 참고용으로 차이를 명시. 24개 작성 시 본문 시나리오도 시뮬레이터 규칙과 일치시키는 게 깔끔.

5. **`detail` 필드 사용 일관성**: 어떤 슬롯은 detail 이 있고 어떤 슬롯은 없음. 작성 가이드 필요 — 권장: GT 16개 모두 detail 채우기 (시뮬레이터 답변 풍부화에 도움).