---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — confused × medium)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-016
case_title: "부동산 사장 대행 통보를 혼동한 관리직"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: confused
difficulty: medium
move_out_status: moving_out_planned
notice_method: [phone]
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
  - notice_recipient
  - notice_method_validity
  - kakao_records
  - certified_mail
  - leasehold_registration
  - registry_not_checked

# --- 4. 카운트 ---
hidden_info_count: 10
expected_ia_turns: 12

# --- 5. 페르소나 ---
persona:
  name: "임재석"
  age: 43
  occupation: "대기업 관리직"
  residence_history: "서울 은평구 오피스텔 전세 2년 거주"
  current_situation: "계약 종료 후 보증금 1억원 전액 미반환. 본인이 직접 통보하지 않고 부동산 사장이 전화로 대신 말한 상황을 통보로 봐도 되는지 혼동"

# --- 6. 첫 발화 ---
first_utterance: |
  계약서는 있어요. 계약은 끝났는데 제가 직접 말한 게 아니라
  부동산 사장님이 집주인한테 전화했다는데 그게 통보가 맞는지 모르겠어요.
  보증금 1억 받아야 이사 준비하는데, 집주인은 알겠다고 했대요.
  아직 집에 살고 있고 곧 나가야 해서요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2023-10-15"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2025-10-14"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 100000000
    unit: KRW
    detail: "1억원"
  unreturned_amount:
    value: 100000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2023-10-16 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-10-15 확정일자 부여"
  has_moved_out:
    value: false
    detail: "아직 거주 중이며 다음 집 계약을 준비 중"
  notice_date:
    value: "2025-09-05"
    detail: "부동산 사장이 집주인에게 전화한 날짜. 본인 직접 통보는 아님"
  notice_method:
    value: [phone]
    detail: "부동산 사장 대행 전화 통보"
  landlord_responded:
    value: true
    detail: "부동산 사장에게 '알겠다, 정리해보겠다'고 답변"
  has_kakao_records:
    value: false
    detail: "본인과 집주인 사이 카톡·문자 기록 없음"
  has_certified_mail:
    value: false
    detail: "내용증명 발송 안 함"
  has_transfer_records:
    value: true
    detail: "보증금 입금 이체 내역 보유"
  has_lien_registration:
    value: false
    detail: "아직 이사 전이라 신청 안 함. 제도 이해도 부족"
  registry_check:
    value: false
    detail: "등기부등본 확인 안 함"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: low
    amount_precision: low
    emotion_level: medium
    uncertainty_phrases:
      - "그게 뭐예요?"
      - "그게 맞는 건지 모르겠어요"
      - "부동산 사장님이 그렇게 말해서요"
      - "정확히는 잘..."
  proactive_speech_pool:
    - "회사 일 때문에 제가 직접 챙기질 못했어요."
    - "부동산 쪽에서 알아서 해준다고 해서 믿었어요."
    - "절차가 뭘 기준으로 되는지 잘 모르겠어요."
    - "괜히 제가 잘못 이해한 건가 싶어요."
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 부동산 사장 대행 통보를 혼동한 관리직

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 임재석 (43세)
- **직업**: 대기업 관리직
- **거주 이력**: 서울 은평구 오피스텔 전세 2년 거주
- **현재 상황**: 보증금 1억원 전액 미반환. 부동산 사장이 대신 전화한 것을 통보로 봐도 되는지 혼동

### 이 케이스의 특징

- **`confused × medium` 두 번째 표본**: 003은 본인이 전화 통보를 혼동, 016은 부동산 사장 대행 통보를 혼동
- **통보 주체 분리**: 계약 당사자는 의뢰인이지만 실제 전달자는 부동산 사장
- **moving_out_planned**: 아직 거주 중이나 다음 집 이사 준비 필요
- **통보 증거 약함**: 본인 휴대폰 기록이 없고 부동산 사장 진술에 의존
- **v1 순수 케이스**: 법률 쟁점 태그 없이 정보 수집 난이도만 테스트

### first_utterance에서 드러나는 정보 (6개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_contract_doc` | "계약서는 있어요" |
| `deposit_amount` | "1억" |
| `unreturned_amount` | "받아야" → 전액 미반환 정황 |
| `has_moved_out` | "아직 집에 살고 있고 곧 나가야" |
| `notice_method` | "전화했다는데" |
| `landlord_responded` | "알겠다고 했대요" |

→ hidden = 16 - 6 = **10** → `medium`

### 질문받아야 드러나는 정보

계약 시작·종료일, 전입신고·확정일자, 정확한 통보일, 카톡 기록 부재, 내용증명 미발송, 이체 내역, 임차권등기 미신청, 등기부 미확인.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 6개 슬롯

### Turn 1 — 계약 기간 정확화

> **AI**: 계약 시작일과 종료일이 언제였나요?
>
> **의뢰인**: 2023년 10월 15일부터 2025년 10월 14일까지였어요.

수집: `contract_start_date`, `contract_end_date`

### Turn 2 — 통보 주체와 날짜

> **AI**: 부동산 사장님이 집주인에게 전화한 날짜와 내용을 알 수 있을까요?
>
> **의뢰인**: 9월 5일쯤이라고 들었어요. 집주인이 알겠다고 했다고만 들었고요.

수집: `notice_date`, `notice_method`, `landlord_responded`

### Turn 3~10 — 체크리스트 순차 수집

전입신고, 확정일자, 카톡·문자 기록 부재, 내용증명 미발송, 이체 내역, 임차권등기 미신청, 등기부 미확인을 확인한다.

### Turn 11 — 수집 완료 확인

> **AI**: 말해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 남기실 내용이 있나요?
>
> **의뢰인**: "지금 생각나는 건 없어요"

## 3. 변환/설계 메모

1. **016 핵심은 대행 통보**: 005의 부모님 대행과 다르게 제3자인 부동산 중개인이 전달자.
2. **confused 발현 지점**: "대신 말한 것도 통보인지"를 계속 되묻는다.
3. **부차 분포 기여**: moving_out_planned와 단일 통보 추가.
4. **증거 취약성은 v1 risk로만 처리**: `issue_tags`는 비워 v1 순수 케이스 유지.

