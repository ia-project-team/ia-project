---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — emotional × medium_high)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-021
case_title: "사기 의심으로 불안한 영상편집자 보증금 미반환"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: emotional
difficulty: medium_high
move_out_status: moving_out_planned
notice_method: [sms, certified_mail]
evidence_items:
  - contract_doc
  - sms_records
  - certified_mail
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
  - kakao_records
  - leasehold_registration
  - registry_details_unclear

# --- 4. 카운트 ---
hidden_info_count: 12
expected_ia_turns: 13

# --- 5. 페르소나 ---
persona:
  name: "박준영"
  age: 28
  occupation: "영상편집자"
  residence_history: "서울 관악구 원룸 전세 2년 거주"
  current_situation: "계약 종료 후 보증금 8천만원 전액 미반환. 다른 세입자 피해 소문을 듣고 사기 의심이 커졌으며, 문자와 내용증명까지 보냈지만 집주인은 말만 바꿈"

# --- 6. 첫 발화 ---
first_utterance: |
  이거 사기 아닌가요? 집주인이 계속 말만 바꾸고 다른 세입자도 당했다는 얘기를 들었어요.
  저는 아직 나가진 못했는데 곧 나가야 하고, 문자도 보내고 내용증명도 보냈어요.
  답은 오는데 계속 미루니까 너무 불안해요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2024-03-01"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2026-02-28"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 80000000
    unit: KRW
    detail: "8천만원"
  unreturned_amount:
    value: 80000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2024-03-02 전입신고"
  has_fixed_date:
    value: true
    detail: "2024-03-01 확정일자 부여"
  has_moved_out:
    value: false
    detail: "아직 거주 중이나 곧 이사 예정"
  notice_date:
    value: "2026-01-10"
    detail: "문자로 최초 반환 요청. 2026-02-05 내용증명 발송"
  notice_method:
    value: [sms, certified_mail]
    detail: "문자 후 내용증명"
  landlord_responded:
    value: true
    detail: "'다음 주', '정리 중'처럼 말만 바꾸며 반환 지연"
  has_kakao_records:
    value: false
    detail: "카톡 사용 안 함"
  has_certified_mail:
    value: true
    detail: "내용증명 발송본과 수령 통지 보관"
  has_transfer_records:
    value: true
    detail: "보증금 입금 이체 내역 보유"
  has_lien_registration:
    value: false
    detail: "아직 이사 전이라 신청 안 함"
  registry_check:
    value: true
    detail: "등기부등본 확인했으나 세부 권리관계는 정확히 이해하지 못함"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: medium
    amount_precision: medium
    emotion_level: high
    uncertainty_phrases:
      - "하..."
      - "제가 잘못 걸린 건가 싶어요."
      - "정확히는 기억이 잘 안 나요."
      - "너무 불안해요."
  proactive_speech_pool:
    - "인터넷에서 비슷한 이야기를 보고 더 무서워졌어요."
    - "주변에서 빨리 움직이라고 해서 마음이 급해요."
    - "작업도 손에 안 잡혀요."
    - "괜히 혼자 당한 건 아닌가 싶어요."
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 사기 의심으로 불안한 영상편집자 보증금 미반환

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 박준영 (28세)
- **직업**: 영상편집자
- **거주 이력**: 서울 관악구 원룸 전세 2년 거주
- **현재 상황**: 사기 의심이 커진 상태에서 보증금 8천만원 전액 미반환

### 이 케이스의 특징

- **`emotional × medium_high` 두 번째 표본**: 020은 근저당 불안, 021은 사기 의심형 불안
- **문자+내용증명 조합**: 다중 통보이지만 카톡 없음
- **moving_out_planned**: 아직 거주 중이나 이사 예정
- **답변은 있으나 말 바꿈**: landlord_responded true
- **v1 순수 케이스**: 사기 의심은 정황일 뿐 `issue_tags`는 비움

### first_utterance에서 드러나는 정보 (4개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_moved_out` | "아직 나가진 못했는데 곧 나가야" |
| `notice_method` | "문자... 내용증명" |
| `has_certified_mail` | "내용증명도 보냈어요" |
| `landlord_responded` | "답은 오는데" |

→ hidden = 16 - 4 = **12** → `medium_high`

### 질문받아야 드러나는 정보

계약서, 계약 기간, 보증금·미반환 금액 정확값, 전입신고·확정일자, 통보일, 카톡 기록 부재, 이체 내역, 임차권등기, 등기부 확인.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 4개 슬롯

### Turn 1 — 금액 확인

> **AI**: 보증금 총액과 아직 돌려받지 못한 금액을 알려주세요.
>
> **의뢰인**: 8천만원이고 하나도 못 받았어요.

수집: `deposit_amount`, `unreturned_amount`

### Turn 2~11 — 체크리스트 순차 수집

계약 기간, 전입신고·확정일자, 최초 통보일, 증거자료, 이체 내역, 임차권등기, 등기부 확인을 확인한다.

### Turn 12 — 수집 완료 확인

> **의뢰인**: "지금 생각나는 건 없어요"

## 3. 변환/설계 메모

1. **사기 의심은 issue가 아니라 정황**: v1 순수 케이스로 유지.
2. **emotional medium_high 다양화**: 근저당형과 사기 의심형을 분리.
3. **다중 통보 분포 기여**: sms+certified_mail 조합 추가.
4. **카운트 주의**: 금액 정확값은 첫 발화에 없으므로 후속 질문 필수.
