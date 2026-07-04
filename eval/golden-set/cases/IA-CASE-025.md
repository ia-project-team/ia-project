---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — avoidant × medium_high)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-025
case_title: "부분 반환 잔금 액수를 회피하는 현장관리자"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: avoidant
difficulty: medium_high
move_out_status: moved_out
notice_method: [sms, kakao]
evidence_items:
  - contract_doc
  - sms_records
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
  - deposit_amount
  - unreturned_amount
  - contract_start_date
  - notice_date
  - certified_mail
  - leasehold_registration

# --- 4. 카운트 ---
hidden_info_count: 13
expected_ia_turns: 13

# --- 5. 페르소나 ---
persona:
  name: "권태준"
  age: 46
  occupation: "건설현장 관리자"
  residence_history: "경남 창원시 성산구 아파트 전세 2년 거주 후 퇴거"
  current_situation: "보증금 1억 4천만원 중 8천만원을 여러 차례 나눠 받고 6천만원 잔금이 미반환. 본인이 정확한 잔금 액수 산정을 회피"

# --- 6. 첫 발화 ---
first_utterance: |
  보증금이 좀 남아 있어요.
  이사는 나왔고 집주인이 조금씩 준다고는 했습니다.
  제가 계산을 정확히 못 해서요. 문자랑 카톡으로 계속 얘기는 했어요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2023-02-01"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2025-01-31"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 140000000
    unit: KRW
    detail: "1억 4천만원"
  unreturned_amount:
    value: 60000000
    unit: KRW
    detail: "총 8천만원을 나눠 반환받고 6천만원 미반환"
  has_resident_reg:
    value: true
    detail: "2023-02-02 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-02-01 확정일자 부여"
  has_moved_out:
    value: true
    detail: "2025-02-20 퇴거 완료"
  notice_date:
    value: "2025-01-05"
    detail: "문자로 최초 반환 요청, 이후 카톡으로 반복"
  notice_method:
    value: [sms, kakao]
    detail: "문자 후 카톡 반복"
  landlord_responded:
    value: true
    detail: "'조금씩 주겠다'고 답변 후 일부만 반환"
  has_kakao_records:
    value: true
    detail: "카톡·문자 캡처 보관"
  has_certified_mail:
    value: false
    detail: "내용증명 발송 안 함"
  has_transfer_records:
    value: true
    detail: "최초 입금 내역과 여러 차례 부분 반환 입금 내역 보유"
  has_lien_registration:
    value: false
    detail: "임차권등기명령 신청 안 함"
  registry_check:
    value: true
    detail: "퇴거 전 등기부등본 확인. 소유자 변경 없음"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: low
    amount_precision: low
    emotion_level: low
    uncertainty_phrases:
      - "음..."
      - "정확히 계산하면..."
      - "그게 좀 복잡합니다."
      - "통장을 다시 봐야 해요."
  proactive_speech_pool:
    - "현장 일이 바빠서 정리를 제대로 못 했습니다."
    - "제가 숫자 정리를 미뤄둔 게 있긴 합니다."
    - "괜히 복잡하게 보일까 봐 걱정됩니다."
    - "좋게 해결하고 싶었습니다."
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 부분 반환 잔금 액수를 회피하는 현장관리자

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 권태준 (46세)
- **직업**: 건설현장 관리자
- **거주 이력**: 경남 창원시 성산구 아파트 전세 2년 거주 후 퇴거
- **현재 상황**: 부분 반환 후 6천만원 잔금 미반환

### 이 케이스의 특징

- **`avoidant × medium_high` 첫 진입**: 금액 산정 회피가 핵심
- **부분 반환 고난도**: 첫 발화에는 정확한 보증금·잔금 액수 없음
- **문자+카톡 다중 통보**: 증거는 있으나 액수 정리를 회피
- **경남 창원 신규 지역**
- **v1 순수 케이스**

### first_utterance에서 드러나는 정보 (3개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_moved_out` | "이사는 나왔고" |
| `landlord_responded` | "조금씩 준다고" |
| `notice_method` | "문자랑 카톡" |

→ hidden = 16 - 3 = **13** → `medium_high`

### 질문받아야 드러나는 정보

계약서, 계약 기간, 보증금 총액·반환액·잔금, 전입신고·확정일자, 통보일, 증거, 내용증명, 이체 내역, 임차권등기, 등기부 확인.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 3개 슬롯

### Turn 1 — 금액 회피 해소

> **AI**: 총 보증금과 이미 받은 금액, 남은 금액을 나눠서 알려주세요.
>
> **의뢰인**: 총 1억 4천이었고, 받은 게 8천쯤 됩니다. 남은 건 6천이에요.

수집: `deposit_amount`, `unreturned_amount`

### Turn 2~11 — 체크리스트 순차 수집

계약 기간, 전입신고·확정일자, 통보일, 증거, 내용증명, 이체 내역, 권리보전, 등기부 확인을 묻는다.

### Turn 12 — 수집 완료 확인

> **의뢰인**: "지금 생각나는 건 없어요"

## 3. 변환/설계 메모

1. **avoidant의 금액 회피**: 004는 부분반환 사실 은닉, 025는 잔금 산정 자체를 회피.
2. **부분반환 분포 보강**: 015·024에 이어 신규 부분반환 케이스.
3. **medium_high 카운트**: 정확 금액과 날짜를 거의 숨김.
4. **부차 분포 기여**: moved_out, 다중 통보, 부분반환.

