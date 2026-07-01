---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-06-24 (new v1 case for demo)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-008
case_title: "거짓 약속 반복받는 보증금 미반환"
schema_version: "0.1"
created_at: "2026-06-24"
last_updated: "2026-06-30"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: over_explaining
difficulty: high                      # 재분류 2026-06-30: hidden_info_count 정의 보정
move_out_status: living_in_property
notice_method: [kakao, phone]
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
  - contract_end_date
  - notice_date
  - notice_method
  - registry_not_checked
  - leasehold_registration

# --- 4. 카운트 ---
hidden_info_count: 14   # 2026-06-30 재산정: landlord_responded + has_moved_out 암시 → 16-2=14
expected_ia_turns: 13

# --- 5. 페르소나 ---
persona:
  name: "윤서연"
  age: 33
  occupation: "프리랜서 디자이너"
  residence_history: "부산 해운대구 빌라 전세 2년 거주"
  current_situation: "계약 종료 후 보증금 8천만원 전액을 못 받고 있으며, 집주인이 매번 다음달에 주겠다고 약속만 반복"

# --- 6. 첫 발화 ---
first_utterance: |
  집주인이 보증금을 안 줘서 너무 답답해요.
  처음에는 다음달에 준다고 했는데 그게 벌써 세 번째예요.
  계속 "조만간 정리될 거다"라고만 하고 있고요.
  저는 새 집도 알아보고 싶은데 보증금이 묶여 있어서 못 움직이고 있어요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "원본 보유, 사진도 따로 찍어둠"
  contract_start_date:
    value: "2023-02-15"
  contract_end_date:
    value: "2025-02-14"
  deposit_amount:
    value: 80000000
    unit: KRW
  unreturned_amount:
    value: 80000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2023-02-16 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-02-15 확정일자"
  has_moved_out:
    value: false
    detail: "보증금 못 받아 계속 거주 중"
  notice_date:
    value: "2025-01-10"
    detail: "최초 통보일 (이후 여러 번 추가 연락)"
  notice_method:
    value: [kakao, phone]
    detail: "처음엔 전화, 이후 카톡으로 여러 번"
  landlord_responded:
    value: true
    detail: "매번 다음달, 조만간 같은 약속 반복. 지키지 않음"
  has_kakao_records:
    value: true
    detail: "카톡 전체 대화 캡처 보관"
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
    date_precision: medium       # 과잉설명형이라 이야기는 많지만 정확한 날짜 흐릿
    amount_precision: high
    emotion_level: medium
    uncertainty_phrases:
      - "정확히는 기억이 안 나는데..."
      - "그 무렵에..."
  proactive_speech_pool:
    - "집주인이 처음에는 좋은 사람 같았어요"
    - "다음달에 준다는 말만 벌써 세 번째예요"
    - "주변에서는 변호사 만나라고 하는데 저는 어디서부터 시작해야 할지 모르겠어요"
    - "새 집 알아보고 싶은데 보증금이 묶여 있어서 못 움직여요"
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 거짓 약속 반복받는 보증금 미반환

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 윤서연 (33세)
- **직업**: 프리랜서 디자이너
- **거주 이력**: 부산 해운대구 빌라 전세 2년 거주
- **현재 상황**: 계약 종료 후 보증금 8천만원 전액 미반환, 집주인이 다음달 약속을 반복하며 미루는 중

### 이 케이스의 특징 (다른 케이스와의 차별점)

- **멀티 채널 통보**: `notice_method: [kakao, phone]`. 처음엔 전화, 이후 카톡 여러 번. notice_method가 단일 값이 아닌 배열로 들어가는 케이스
- **과잉설명형 페르소나**: 첫 발화부터 4문장 이상. 정황과 감정을 많이 말하지만 핵심 슬롯 정보(날짜, 액수)는 명확히 안 함. IA가 산만한 발화 속에서 정확한 정보를 끌어내야 함
- **반복된 거짓 약속**: 집주인이 답변은 했지만 (`landlord_responded: true`), 그 답변이 약속 반복 패턴. 의뢰인이 이 패턴을 강조함
- **단순 케이스이지만 정보 추출 난이도 중간**: `issue_tags: []`로 v1 순수, 그러나 과잉설명형이라 단일턴 baseline이 정보 정리에 실패할 가능성 높음

### 의뢰인이 자발적으로 말할 정보 (= 첫 발화)

- 집주인이 보증금 안 돌려줌
- 다음달 약속 반복
- 새 집 못 알아봄
- 답답함, 분노 등 감정
- 정확한 날짜, 액수, 통보 방식, 증거자료 여부는 첫 발화에 없음

### 질문받아야 드러나는 정보

- 보증금 정확한 액수 (8천만원)
- 계약 시작일/종료일
- 통보 시점과 채널 (전화 + 카톡 둘 다)
- 카톡 기록 보유 여부
- 등기부등본 확인 안 한 사실
- 임차권등기명령 미신청

---

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: 집주인이 보증금을 안 줘서 너무 답답해요. 처음에는 다음달에 준다고 했는데 그게 벌써 세 번째예요. 계속 "조만간 정리될 거다"라고만 하고 있고요. 저는 새 집도 알아보고 싶은데 보증금이 묶여 있어서 못 움직이고 있어요.

### Turn 1~12 — 체크리스트 순차 수집

각 슬롯을 명시적으로 물어 정보 추출. 과잉설명형이라 IA가 질문을 짧고 명확하게 던져야 의뢰인이 본론으로 답함.

핵심 분기 포인트:

- **Turn 6 (통보 방식)**: 의뢰인이 "처음엔 전화로, 그 다음엔 카톡으로 여러 번"이라고 답해야 함. IA는 `notice_method`에 `[phone, kakao]` 둘 다 기록해야 함. 단일 채널만 잡으면 정보 누락
- **Turn 7 (집주인 답변)**: 의뢰인이 약속 반복 패턴을 자세히 설명. IA는 핵심만 `landlord_responded: true`로 잡고, 자세한 정황은 detail로
- **Turn 9 (내용증명)**: 안 보냄. IA가 명확히 물어야 누락 안 됨

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

1. **notice_method 다중 값 검증**: GT는 `[kakao, phone]` 두 값. IA가 단일 통보 방식만 잡으면 부분 점수 처리해야 하는지, 또는 두 값 다 잡아야 success로 칠지 결정 필요. **권장: 두 값 다 잡으면 success, 한 개만 잡으면 partial credit**. Code Evaluator에 이 룰 명시 필요.

2. **과잉설명형 시뮬레이터 튜닝**: `proactive_speech_pool`에 정황/감정 발화를 풍부하게 두되 GT 슬롯 정보는 일절 포함 안 함. open question에는 짧게 답 (베이스라인 LLM이 정보 캐기 어려운 환경 조성).

3. **단일턴 baseline 평가 어려움 예상**: 과잉설명형 첫 발화로부터 GPT/Claude 일반 프롬프트가 어떤 슬롯을 자발적으로 추출하는지가 흥미로운 비교 포인트. 첫 발화에 액수도 정확히 없고 날짜도 없어서, 단일턴 응답이 추측에 의존할 가능성 높음.

4. **multi-channel notice 후속**: notice_method 배열 처리는 frontmatter 스펙 v0에 이미 반영됨. 다만 데모 시 시뮬레이터가 "처음 전화, 이후 카톡"의 순서를 자연스럽게 답하도록 시스템 프롬프트 튜닝 필요.
