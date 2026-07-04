---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — fragmented × medium_high)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-022
case_title: "초단문 첫 발화 - 퇴거 후 무응답"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: fragmented
difficulty: medium_high
move_out_status: moved_out
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
  - contract_end_date
  - deposit_amount
  - notice_date
  - kakao_records
  - certified_mail
  - leasehold_registration
  - registry_not_checked
  - landlord_no_response

# --- 4. 카운트 ---
hidden_info_count: 13
expected_ia_turns: 13

# --- 5. 페르소나 ---
persona:
  name: "송유리"
  age: 30
  occupation: "은행원"
  residence_history: "부산 동래구 빌라 전세 2년 거주 후 퇴거"
  current_situation: "퇴거 후 보증금 9천 5백만원 전액 미반환. 전화로 연락했으나 집주인 무응답. 첫 발화가 극도로 짧음"

# --- 6. 첫 발화 ---
first_utterance: |
  이사 나왔는데 보증금 못 받았어요.
  전화했는데 답 없어요.
  상담 가능해요?

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2023-05-20"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2025-05-19"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 95000000
    unit: KRW
    detail: "9천 5백만원"
  unreturned_amount:
    value: 95000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2023-05-21 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-05-20 확정일자 부여"
  has_moved_out:
    value: true
    detail: "2025-06-01 이사 완료"
  notice_date:
    value: "2025-04-25"
    detail: "전화로 최초 반환 요청"
  notice_method:
    value: [phone]
    detail: "전화 단독"
  landlord_responded:
    value: false
    detail: "전화 후 콜백·답변 없음"
  has_kakao_records:
    value: false
    detail: "카톡·문자 기록 없음"
  has_certified_mail:
    value: false
    detail: "내용증명 발송 안 함"
  has_transfer_records:
    value: true
    detail: "보증금 입금 이체 내역 보유"
  has_lien_registration:
    value: false
    detail: "퇴거 전 신청 못 함"
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
      - "몰라요."
      - "기억 안 나요."
  proactive_speech_pool:
    - "짧게 말씀드릴게요."
    - "필요한 것만 물어봐 주세요."
    - "더 설명할 건 없어요."
    - "네."
  open_question_response: "없어요."
---

# 시나리오 — 초단문 첫 발화 퇴거 후 무응답

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 송유리 (30세)
- **직업**: 은행원
- **거주 이력**: 부산 동래구 빌라 전세 2년 거주 후 퇴거
- **현재 상황**: 전화 후 무응답, 보증금 9천 5백만원 전액 미반환

### 이 케이스의 특징

- **`fragmented × medium_high` 첫 진입**: 초단문 3문장만 제공
- **퇴거 완료 + 무응답**: 이사 완료 후 권리보전 미이행
- **전화 단독 통보**: 객관 기록이 약한 구성
- **부산 동래구 신규 지역**
- **v1 순수 케이스**: `issue_tags: []`

### first_utterance에서 드러나는 정보 (3개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_moved_out` | "이사 나왔는데" |
| `notice_method` | "전화했는데" |
| `landlord_responded` | "답 없어요" |

→ hidden = 16 - 3 = **13** → `medium_high`

### 질문받아야 드러나는 정보

계약서, 계약 기간, 금액, 전입신고·확정일자, 통보일, 카톡 기록 부재, 내용증명, 이체 내역, 임차권등기, 등기부 확인.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 3개 슬롯

### Turn 1~11 — 슬롯별 명시 질문

단편형이라 계약서, 날짜, 금액, 전입신고, 증거자료, 권리보전 여부를 각각 짧게 묻고 답을 받아야 한다.

### Turn 12 — 수집 완료 확인

> **의뢰인**: "없어요."

## 3. 변환/설계 메모

1. **초단문 방향성 준수**: 힌트의 2~3문장 첫 발화를 그대로 반영.
2. **medium_high 하단이 아닌 상단**: hidden 13으로 high 직전 난이도.
3. **fragmented 본질 강화**: proactive pool과 open question 모두 극단적으로 짧음.
4. **부차 분포 기여**: moved_out, 단일 통보, landlord false 추가.

