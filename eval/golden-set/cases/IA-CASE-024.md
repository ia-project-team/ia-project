---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — confused × medium_high)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-024
case_title: "부분 반환 액수를 헷갈리는 미용사 보증금 미반환"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: confused
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
  - deposit_amount
  - unreturned_amount
  - contract_start_date
  - fixed_date
  - notice_date
  - kakao_records
  - certified_mail
  - leasehold_registration
  - registry_not_checked

# --- 4. 카운트 ---
hidden_info_count: 13
expected_ia_turns: 13

# --- 5. 페르소나 ---
persona:
  name: "고은별"
  age: 36
  occupation: "미용사"
  residence_history: "제주 제주시 빌라 전세 2년 거주 후 퇴거"
  current_situation: "보증금 1억 1천만원 중 2천만원만 돌려받고 9천만원 미반환. 본인은 얼마를 받은 건지, 얼마가 남은 건지 계속 헷갈림"

# --- 6. 첫 발화 ---
first_utterance: |
  보증금을 일부 받긴 했는데 제가 아직 받아야 하는 돈이 얼마인지 헷갈려요.
  이사 나왔고 집주인이 전화로 조금씩 준다고 했어요.
  뭐부터 확인해야 하는지도 모르겠어요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2023-03-15"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2025-03-14"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 110000000
    unit: KRW
    detail: "1억 1천만원"
  unreturned_amount:
    value: 90000000
    unit: KRW
    detail: "2천만원 부분 반환, 9천만원 미반환"
  has_resident_reg:
    value: true
    detail: "2023-03-16 전입신고"
  has_fixed_date:
    value: false
    detail: "확정일자 부여 안 받음. 본인은 받은 줄 알았는지 헷갈림"
  has_moved_out:
    value: true
    detail: "2025-04-01 이사 완료"
  notice_date:
    value: "2025-02-20"
    detail: "전화로 최초 반환 요청"
  notice_method:
    value: [phone]
    detail: "전화 단독 통보"
  landlord_responded:
    value: true
    detail: "'조금씩 주겠다'고 답변 후 2천만원만 반환"
  has_kakao_records:
    value: false
    detail: "전화로만 이야기해 카톡 기록 없음"
  has_certified_mail:
    value: false
    detail: "내용증명 발송 안 함"
  has_transfer_records:
    value: true
    detail: "최초 입금 내역과 2천만원 반환 입금 내역 보유"
  has_lien_registration:
    value: false
    detail: "임차권등기명령 제도 모름"
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
      - "제가 계산을 잘 못해서요."
      - "받은 것 같기도 하고..."
      - "정확히는 통장 봐야 해요."
  proactive_speech_pool:
    - "가게 일 끝나고 보려니 머리가 안 돌아가요."
    - "숫자를 제가 자꾸 헷갈려요."
    - "주변에서 정리부터 하라고 하더라고요."
    - "혼자 하려니 어렵네요."
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 부분 반환 액수를 헷갈리는 미용사 보증금 미반환

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 고은별 (36세)
- **직업**: 미용사
- **거주 이력**: 제주 제주시 빌라 전세 2년 거주 후 퇴거
- **현재 상황**: 1억 1천만원 중 2천만원만 돌려받고 9천만원 미반환

### 이 케이스의 특징

- **`confused × medium_high` 두 번째 표본**: 005는 부모님 대행, 024는 부분반환 액수 혼동
- **부분 반환 혼동**: 정확한 `deposit_amount`와 `unreturned_amount`를 IA가 분리 질문해야 함
- **확정일자 false**: 본인은 절차를 정확히 이해하지 못함
- **제주 신규 지역**
- **v1 순수 케이스**

### first_utterance에서 드러나는 정보 (3개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_moved_out` | "이사 나왔고" |
| `notice_method` | "전화로" |
| `landlord_responded` | "조금씩 준다고" |

→ hidden = 16 - 3 = **13** → `medium_high`

### 질문받아야 드러나는 정보

계약서, 계약 기간, 보증금 총액·반환액·잔액, 전입신고·확정일자, 통보일, 카톡 기록 부재, 내용증명, 이체 내역, 임차권등기, 등기부 확인.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 3개 슬롯

### Turn 1 — 금액 분리 확인

> **AI**: 총 보증금과 이미 받은 금액, 아직 못 받은 금액을 따로 확인할게요.
>
> **의뢰인**: 총 1억 1천이었고 2천만 받았어요. 남은 건 9천인 것 같아요.

수집: `deposit_amount`, `unreturned_amount`

### Turn 2~11 — 체크리스트 순차 수집

계약 기간, 전입신고·확정일자, 통보일, 증거자료, 이체 내역, 권리보전, 등기부 확인을 묻는다.

### Turn 12 — 수집 완료 확인

> **의뢰인**: "지금 생각나는 건 없어요"

## 3. 변환/설계 메모

1. **부분반환 추가 표본**: 015와 달리 첫 발화에 정확 금액을 숨김.
2. **confused 발현**: 금액 계산과 확정일자 이해에서 모두 헷갈림.
3. **부차 분포 기여**: moved_out, 단일 통보, 부분반환.
4. **medium_high 카운트**: 첫 발화 노출 3개로 상단 난이도.

