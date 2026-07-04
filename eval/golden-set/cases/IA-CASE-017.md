---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — avoidant × medium)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-017
case_title: "늦은 통보를 숨기는 보험설계사 보증금 미반환"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: avoidant
difficulty: medium
move_out_status: moved_out
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
  - notice_date
  - notice_method_validity
  - certified_mail
  - leasehold_registration

# --- 4. 카운트 ---
hidden_info_count: 9
expected_ia_turns: 10

# --- 5. 페르소나 ---
persona:
  name: "서민규"
  age: 39
  occupation: "보험설계사"
  residence_history: "경기 수원 영통구 빌라 전세 2년 거주 후 퇴거"
  current_situation: "2년 계약 종료 후 보증금 1억 2천만원 전액 미반환. 종료 직전에야 카톡으로 반환 요청한 사실을 불리하게 느껴 처음에는 구체 날짜를 숨김"

# --- 6. 첫 발화 ---
first_utterance: |
  계약서는 있고 4월에 계약 끝나서 이사 나왔는데 보증금 1억 2천을 아직 못 받았습니다.
  집주인한테는 카톡으로 말했고 답도 받았어요.
  제가 좀 늦게 말한 건 아닌지 싶은데 일단 돈을 안 줘서요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2023-04-10"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2025-04-09"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 120000000
    unit: KRW
    detail: "1억 2천만원"
  unreturned_amount:
    value: 120000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2023-04-11 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-04-10 확정일자 부여"
  has_moved_out:
    value: true
    detail: "2025-04-20 이사 완료"
  notice_date:
    value: "2025-04-05"
    detail: "계약 종료 4일 전 카톡으로 뒤늦게 반환 요청. avoidant 핵심 발현"
  notice_method:
    value: [kakao]
    detail: "카톡 단독 통보"
  landlord_responded:
    value: true
    detail: "'확인해보겠다'고 답변했으나 반환 없음"
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
    detail: "늦은 통보 문제에 신경 쓰다 임차권등기명령을 알아보지 못함"
  registry_check:
    value: true
    detail: "퇴거 전 등기부등본 확인. 소유자 변경 없음"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: high
    amount_precision: high
    emotion_level: low
    uncertainty_phrases:
      - "음..."
      - "사실..."
      - "그게 좀..."
      - "정확히는 말씀드리면..."
  proactive_speech_pool:
    - "제가 절차를 완벽히 챙긴 건 아니라서요."
    - "괜히 제 쪽 실수로 보일까 봐 걱정돼요."
    - "일하면서 정신이 없었습니다."
    - "좋게 끝내고 싶었는데 일이 커졌네요."
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 늦은 통보를 숨기는 보험설계사 보증금 미반환

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 서민규 (39세)
- **직업**: 보험설계사
- **거주 이력**: 경기 수원 영통구 빌라 전세 2년 거주 후 퇴거
- **현재 상황**: 보증금 1억 2천만원 전액 미반환. 늦은 통보를 본인 실수로 느껴 날짜를 늦게 말함

### 이 케이스의 특징

- **`avoidant × medium` 두 번째 표본**: 004의 부분반환 은닉과 달리 017은 늦은 통보 은닉
- **통보 시점이 핵심**: 계약 종료 4일 전 통보라 `notice_date`를 직접 물어야 드러남
- **카톡 기록은 있음**: 불리한 통보 시점과 달리 증거 자체는 보유
- **퇴거 완료이나 임차권등기 미신청**: 절차 누락을 낮게 말하려는 avoidant 성향
- **v1 순수 케이스**: `issue_tags: []`

### first_utterance에서 드러나는 정보 (7개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_contract_doc` | "계약서는 있고" |
| `contract_end_date` | "4월에 계약 끝나서" |
| `deposit_amount` | "1억 2천" |
| `unreturned_amount` | "아직 못 받았습니다" |
| `has_moved_out` | "이사 나왔는데" |
| `notice_method` | "카톡으로" |
| `landlord_responded` | "답도 받았어요" |

→ hidden = 16 - 7 = **9** → `medium`

### 질문받아야 드러나는 정보

계약 시작일, 전입신고·확정일자, 정확한 통보일, 카톡 기록, 내용증명, 이체 내역, 임차권등기, 등기부 확인.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 7개 슬롯

### Turn 1 — 늦은 통보 확인

> **AI**: 집주인에게 처음 카톡을 보낸 날짜가 언제였나요?
>
> **의뢰인**: 사실 4월 5일이었어요. 계약 끝나기 며칠 전이라 좀 늦긴 했어요.

수집: `notice_date`

### Turn 2~8 — 체크리스트 순차 수집

계약 시작일, 전입신고·확정일자, 카톡 기록, 내용증명 미발송, 이체 내역, 임차권등기 미신청, 등기부 확인을 묻는다.

### Turn 9 — 수집 완료 확인

> **의뢰인**: "지금 생각나는 건 없어요"

## 3. 변환/설계 메모

1. **avoidant 발현 지점 변경**: 001은 권리 미이행, 004는 부분반환, 017은 늦은 통보가 핵심.
2. **부차 분포 기여**: moved_out, 단일 통보, 경기 수원 신규 지역.
3. **첫 발화의 모호한 고백**: "늦게 말한 건 아닌지"라고만 하며 정확 날짜는 숨김.
4. **카톡 기록 보유 true**: 단순한 증거 부재 케이스가 아니라 통보 시점 정확화 케이스.

