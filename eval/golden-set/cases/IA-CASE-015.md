---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — fragmented × medium)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-015
case_title: "부분 반환 후 잔금 미반환 - 60대 주부 단답형"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
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
  - transfer_records
evaluation_purpose:
  - golden_set
  - checklist_recall
  - single_turn_comparison

# --- 3. 평가 분류 ---
issue_tags: []
risk_missing_points:
  - contract_start_date
  - resident_registration
  - fixed_date
  - notice_date
  - certified_mail
  - leasehold_registration
  - registry_not_checked

# --- 4. 카운트 ---
hidden_info_count: 9
expected_ia_turns: 10

# --- 5. 페르소나 ---
persona:
  name: "김순희"
  age: 62
  occupation: "전업주부"
  residence_history: "대구 달서구 아파트 전세 2년 거주 후 퇴거"
  current_situation: "2년 계약 종료 후 이사 완료. 보증금 7천만원 중 3천만원만 돌려받고 4천만원 잔금이 미반환된 상태. 질문받기 전에는 단답으로만 응답"

# --- 6. 첫 발화 ---
first_utterance: |
  계약서는 갖고 있고요. 작년 8월 말에 계약 끝나고 이사 나왔어요.
  보증금 7천 중에 3천만 먼저 받고 4천이 남았어요.
  문자로 말했더니 기다리라고 답은 왔어요.

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
    value: 70000000
    unit: KRW
    detail: "7천만원"
  unreturned_amount:
    value: 40000000
    unit: KRW
    detail: "3천만원 부분 반환받고 4천만원 미반환"
  has_resident_reg:
    value: true
    detail: "2023-09-04 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-09-01 확정일자 부여"
  has_moved_out:
    value: true
    detail: "2025-09-20 자녀 집 근처로 이사 완료"
  notice_date:
    value: "2025-07-30"
    detail: "계약 종료 약 한 달 전 문자로 보증금 반환 요청"
  notice_method:
    value: [sms]
    detail: "문자 단독 통보"
  landlord_responded:
    value: true
    detail: "'며칠만 기다려달라'고 문자 답변 후 3천만원만 반환"
  has_kakao_records:
    value: false
    detail: "카톡은 사용하지 않고 문자만 남아 있음"
  has_certified_mail:
    value: false
    detail: "내용증명 발송 안 함"
  has_transfer_records:
    value: true
    detail: "최초 보증금 이체 내역과 3천만원 반환 입금 내역 보유"
  has_lien_registration:
    value: false
    detail: "임차권등기명령 신청 안 하고 먼저 퇴거"
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
      - "잘 몰라요."
      - "기억은 나요."
  proactive_speech_pool:
    - "말씀드린 게 전부예요."
    - "복잡한 건 잘 몰라요."
    - "자식들이 알아보라고 해서 왔어요."
    - "더 길게 설명할 건 없어요."
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 부분 반환 후 잔금 미반환 60대 주부 단답형

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 김순희 (62세)
- **직업**: 전업주부
- **거주 이력**: 대구 달서구 아파트 전세 2년 거주 후 퇴거
- **현재 상황**: 보증금 7천만원 중 3천만원만 반환받고 4천만원 잔금 미반환

### 이 케이스의 특징

- **`fragmented × medium` 두 번째 진입**: 014의 개발자 단답형과 달리 60대 여성 주부 단답형으로 세대·직업 확장
- **부분 반환 분기**: `deposit_amount`와 `unreturned_amount`가 다름. 004·007 이후 부분반환 추가 표본
- **문자 단독 통보**: 카톡 없이 문자만 사용. 단답형이라 IA가 증거 보유 여부를 따로 물어야 함
- **퇴거 후 권리보전 미이행**: 이사 완료 상태이나 임차권등기·등기부 확인·내용증명 모두 미이행
- **v1 순수 케이스**: `issue_tags: []`

### first_utterance에서 드러나는 정보 (7개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_contract_doc` | "계약서는 갖고 있고요" |
| `contract_end_date` | "작년 8월 말" |
| `deposit_amount` | "7천" |
| `unreturned_amount` | "4천이 남았어요" |
| `has_moved_out` | "이사 나왔어요" |
| `notice_method` | "문자로" |
| `landlord_responded` | "답은 왔어요" |

→ hidden = 16 - 7 = **9** → `medium`

### 질문받아야 드러나는 정보

계약 시작일, 전입신고, 확정일자, 최초 통보일, 카톡 기록 부재, 내용증명 미발송, 계좌이체 내역, 임차권등기 미신청, 등기부 미확인.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 7개 슬롯

### Turn 1 — 계약 시작일·전입신고·확정일자

> **AI**: 계약 시작일과 전입신고·확정일자 여부를 알려주실 수 있을까요?
>
> **의뢰인**: 2023년 9월 1일부터였어요. 전입신고는 며칠 뒤 했고 확정일자는 계약한 날 받았어요.

수집: `contract_start_date`, `has_resident_reg`, `has_fixed_date`

### Turn 2 — 통보 시점과 문자 기록

> **AI**: 처음 문자를 보낸 날짜와 문자 기록 보유 여부를 알려주세요.
>
> **의뢰인**: 7월 30일쯤 보냈어요. 문자는 남아 있어요. 카톡은 안 했어요.

수집: `notice_date`, `has_kakao_records`

### Turn 3~8 — 남은 증거·권리보전 수집

내용증명 미발송, 이체 내역 보유, 임차권등기 미신청, 등기부 미확인을 명시 질문으로 확인한다.

### Turn 9 — 수집 완료 확인

> **AI**: 말해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 남기실 내용이 있나요?
>
> **의뢰인**: "지금 생각나는 건 없어요"

## 3. 변환/설계 메모

1. **B1 잔여 fragmented × medium 채움**: 014와 같은 칸이지만 email·unknown 이동 상태가 아니라 문자·퇴거 완료·부분반환 구성.
2. **부분반환 정확값 검증**: 첫 발화에 7천·3천·4천이 모두 있으므로 IA가 두 금액 슬롯을 혼동하지 않아야 함.
3. **단답형 노년 페르소나**: `proactive_speech_pool`도 짧게 유지해 fragmented 본질을 강화.
4. **부차 분포 기여**: moved_out 추가, 단일 통보 추가, 부분반환 추가.

