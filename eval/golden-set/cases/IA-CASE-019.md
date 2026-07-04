---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-04 (new v1 case — over_explaining × medium)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-019
case_title: "회사·가족 이야기 속 통보 방식 불명확 케이스"
schema_version: "0.1"
created_at: "2026-07-04"
last_updated: "2026-07-04"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: over_explaining
difficulty: medium
move_out_status: unknown
notice_method: [unknown]
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
  - move_out_status
  - notice_date
  - notice_method
  - notice_recipient
  - landlord_no_response
  - kakao_records
  - certified_mail
  - leasehold_registration
  - registry_not_checked

# --- 4. 카운트 ---
hidden_info_count: 9
expected_ia_turns: 11

# --- 5. 페르소나 ---
persona:
  name: "최병철"
  age: 48
  occupation: "물류회사 팀장"
  residence_history: "경기 고양시 일산서구 연립주택 전세 2년 거주"
  current_situation: "계약 종료 후 보증금 1억 6천만원 전액 미반환. 배우자가 집주인 또는 부동산에 말한 것 같지만 통보 방식과 수신자가 불명확하고 이사 여부도 가족 사정 때문에 미정"

# --- 6. 첫 발화 ---
first_utterance: |
  회사에서 지방 발령 얘기가 나오고 애 학교 문제도 있어서 집 문제를 빨리 정리해야 하는데요.
  계약서는 있고 작년 말에 계약이 끝났고 보증금 1억 6천이 아직 안 들어왔어요.
  아내가 말한 것 같긴 한데 집주인한테 직접 한 건지 부동산을 통해 한 건지 정확히 모르겠고,
  답도 제대로 받은 건 없는 것 같아요. 그래서 이사를 해야 하는지도 아직 가족끼리 결론이 안 났어요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2024-01-01"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2025-12-31"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 160000000
    unit: KRW
    detail: "1억 6천만원"
  unreturned_amount:
    value: 160000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2024-01-02 전입신고"
  has_fixed_date:
    value: true
    detail: "2024-01-01 확정일자 부여"
  has_moved_out:
    value: false
    detail: "물리적으로 아직 거주 중이나 가족·회사 사정으로 이사 여부 미정"
  notice_date:
    value: "2025-12-01"
    detail: "배우자가 이 무렵 연락했다고 하나 정확한 수단과 수신자는 불명확"
  notice_method:
    value: [unknown]
    detail: "정확한 통보 방식 미확인. 배우자 또는 부동산을 통한 구두 전달 가능성만 있음"
  landlord_responded:
    value: false
    detail: "명확한 답변을 받은 적 없음"
  has_kakao_records:
    value: false
    detail: "본인이 확인 가능한 카톡·문자 기록 없음"
  has_certified_mail:
    value: false
    detail: "내용증명 발송 안 함"
  has_transfer_records:
    value: true
    detail: "보증금 입금 이체 내역 보유"
  has_lien_registration:
    value: false
    detail: "이사 여부 미정이라 신청 안 함"
  registry_check:
    value: false
    detail: "등기부등본 확인 안 함"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: medium
    amount_precision: medium
    emotion_level: medium
    uncertainty_phrases:
      - "아 그게 그러니까..."
      - "아내한테 물어봐야 정확해요."
      - "회사 일이랑 겹쳐서 정신이 없었어요."
      - "정확히는 잘 모르겠네요."
  proactive_speech_pool:
    - "가족 일정이랑 회사 일정이 다 꼬였어요."
    - "애 학교 문제까지 있어서 결정을 못 하겠어요."
    - "집안에서 이야기가 계속 바뀌고 있어요."
    - "제가 직접 챙기지 못한 게 문제인 것 같아요."
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 회사·가족 이야기 속 통보 방식 불명확 케이스

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 최병철 (48세)
- **직업**: 물류회사 팀장
- **거주 이력**: 경기 고양시 일산서구 연립주택 전세 2년 거주
- **현재 상황**: 보증금 1억 6천만원 전액 미반환. 통보 방식과 이사 여부가 모두 불명확

### 이 케이스의 특징

- **`over_explaining × medium` 두 번째 표본**: 018은 이웃 갈등 잡음, 019는 회사·가족 의사결정 잡음
- **`notice_method: [unknown]` 신규 진입**: 통보 방식 자체가 확정되지 않은 v1 수집 난점
- **move_out_status unknown**: 아직 거주 중이나 이사 의사결정이 가족 사정으로 미확정
- **배우자 대행 가능성**: 005 부모님·016 부동산과 다른 가족 내 대행자 유형
- **v1 순수 케이스**: 법률 쟁점화하지 않고 수집 누락 위험으로만 처리

### first_utterance에서 드러나는 정보 (7개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_contract_doc` | "계약서는 있고" |
| `contract_end_date` | "작년 말" |
| `deposit_amount` | "1억 6천" |
| `unreturned_amount` | "아직 안 들어왔어요" |
| `has_moved_out` | "이사를 해야 하는지도 아직... 결론이 안 났어요" |
| `notice_method` | "정확히 모르겠고" → unknown |
| `landlord_responded` | "답도 제대로 받은 건 없는 것 같아요" |

→ hidden = 16 - 7 = **9** → `medium`

### 질문받아야 드러나는 정보

계약 시작일, 전입신고·확정일자, 통보 추정일, 카톡 기록 부재, 내용증명 미발송, 이체 내역, 임차권등기 미신청, 등기부 미확인.

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 7개 슬롯

### Turn 1 — 통보 방식 명확화

> **AI**: 배우자분이 어떤 방식으로 누구에게 알렸는지 확인 가능할까요?
>
> **의뢰인**: 정확히는 모르겠어요. 아내가 부동산에도 얘기한 것 같고 집주인에게도 말한 것 같은데 기록은 제가 못 봤어요.

수집: `notice_method` = [unknown], `has_kakao_records` = false

### Turn 2~9 — 체크리스트 순차 수집

계약 시작일, 전입신고·확정일자, 통보 추정일, 내용증명, 이체 내역, 임차권등기, 등기부 확인을 묻는다.

### Turn 10 — 수집 완료 확인

> **의뢰인**: "지금 생각나는 건 없어요"

## 3. 변환/설계 메모

1. **unknown 통보 어휘 첫 도입**: `notice_method` 어휘집의 미사용 값을 실제 케이스에 진입시킴.
2. **과잉설명형의 잡음 유형 확장**: 이웃 갈등이 아니라 회사 발령·자녀 학교·배우자 역할이 핵심 신호를 흐림.
3. **이동 상태 이중성**: `has_moved_out`은 false이나 `move_out_status`는 unknown.
4. **부차 분포 기여**: unknown 이동 상태와 단일 통보 축에 기여.

