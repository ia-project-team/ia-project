---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-06-30 (new v1 case — emotional × medium)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-006
case_title: "집주인 무응답 보증금 미반환 - 3교대 간호사"
schema_version: "0.1"
created_at: "2026-06-30"
last_updated: "2026-06-30"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: emotional
difficulty: medium                    # hidden 7-10 (§2-3 매핑)
move_out_status: living_in_property
notice_method: [sms, kakao]
evidence_items:
  - contract_doc
  - sms_records
  - kakao_records
  - transfer_records
evaluation_purpose:
  - golden_set
  - checklist_recall
  - single_turn_comparison

# --- 3. 평가 분류 ---
issue_tags: []
# 집주인 무응답 분기 + emotional이 흐릿하게 답하는 슬롯 + v1 단일턴 누락 위험
risk_missing_points:
  - notice_date
  - certified_mail
  - leasehold_registration
  - registry_not_checked
  - landlord_no_response

# --- 4. 카운트 ---
hidden_info_count: 8    # first_utterance 8개 드러남 → hidden 8 → medium (7-10) 중앙
expected_ia_turns: 10

# --- 5. 페르소나 ---
persona:
  name: "정수민"
  age: 31
  occupation: "간호사 (3교대 근무)"
  residence_history: "서울 동작구 빌라 전세 2년 거주"
  current_situation: "계약 종료 후에도 보증금 9천만원 전액 미반환. 종료 한참 전부터 문자·카톡으로 여러 번 요청했으나 집주인이 일절 무응답. 분노와 답답함이 큰 상태"

# --- 6. 첫 발화 ---
first_utterance: |
  너무 화가 나서 어떻게 해야 할지 모르겠어요. 한 2년 동안 살다가
  작년 7월 말에 계약 끝났는데, 끝나기 한참 전부터 보증금 9천만원
  돌려달라고 문자랑 카톡 여러 번 보냈어요. 그런데 답을 안 해요.
  진짜 한 마디도 안 해요. 한 푼도 못 받고 새 집도 못 알아보고
  그냥 답답하게 살고 있어요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2023-08-01"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2025-07-31"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 90000000
    unit: KRW
    detail: "9천만원"
  unreturned_amount:
    value: 90000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2023-08-02 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-08-01 확정일자 받음"
  has_moved_out:
    value: false
    detail: "보증금 못 받아 계약 종료 후에도 계속 거주 중. 3교대 근무로 새 집 알아볼 시간도 부족"
  notice_date:
    value: "2025-06-01"
    detail: "계약 종료 약 두 달 전 첫 문자. 이후 6월 중순·7월 초·7월 말 카톡으로 반복 전송"
  notice_method:
    value: [sms, kakao]
    detail: "처음 문자로 통보, 이후 카톡으로 여러 번 반복. 통보 채널 다중"
  landlord_responded:
    value: false
    detail: "⭐ 모든 통보에 일절 무응답. 카톡 읽음 표시는 됐으나 답변 없음. landlord_no_response 분기"
  has_kakao_records:
    value: true
    detail: "카톡 메시지 전체 캡처. 읽음 표시는 됐으나 답변 없음"
  has_certified_mail:
    value: false
    detail: "내용증명은 보낼 시간이 없었음. 절차도 정확히 모름"
  has_transfer_records:
    value: true
    detail: "보증금 입금 이체 내역 은행 앱에서 확인 가능"
  has_lien_registration:
    value: false
    detail: "임차권등기 제도는 들어봤으나 아직 거주 중이라 신청 안 함"
  registry_check:
    value: false
    detail: "확인 안 함. 3교대 근무로 시간 부족"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: medium        # emotional — 흐릿함 섞임 (§2-2)
    amount_precision: medium      # 보증금 액수는 정확하나 다른 액수 흐릿
    emotion_level: high           # emotional 톤
    uncertainty_phrases:
      - "하... 그게 언제더라"
      - "기억은 잘 안 나는데..."
      - "정확히는 모르겠어요"
  proactive_speech_pool:
    # emotional 본질 보조 정황 — GT 슬롯 정보 직접 노출 없음
    - "3교대라 사람 만나는 시간이 너무 부족해요"
    - "이게 정상이에요? 이렇게 무시당해도 되는 거예요?"
    - "주변에 비슷한 일 겪은 사람도 없어서요"
    - "법적으로 가야 한다는데 어떻게 해야 할지..."
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 집주인 무응답 보증금 미반환

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 정수민 (31세)
- **직업**: 간호사 (3교대 근무)
- **거주 이력**: 서울 동작구 빌라 전세 2년 거주
- **현재 상황**: 계약 종료 후에도 보증금 9천만원 전액 미반환. 종료 전부터 문자·카톡 여러 번 요청했으나 집주인 일절 무응답

### 이 케이스의 특징 (다른 케이스와의 차별점)

- **`emotional × medium` 첫 진입**: 002(`emotional × high`)와 같은 페르소나의 medium 변형. emotional 페르소나가 medium 난이도에서 어떻게 작동하는지 검증
- **`landlord_responded: false` 첫 진입**: 선례 7건(001~005·007·008 전부 true)과 정반대. 무응답 케이스 첫 진입. `risk_missing_points: landlord_no_response` 발현
- **`notice_method: [sms, kakao]` 다중**: 처음 문자, 이후 카톡 반복. 008(`[kakao, phone]`)과 다른 다중 조합
- **3교대 간호사 설정**: 절차 처리 시간 부족이 자연스러움. 내용증명 미발송과 등기부 미확인의 정황적 이유
- **계약 종료됐는데 못 나감**: 002(거주중)와 유사하나 002는 답변 있는 거짓 약속, 006은 답변 자체가 없음

### first_utterance에서 드러나는 정보 (8개)

| 슬롯 | 드러남 근거 |
|---|---|
| `contract_start_date` | "한 2년 동안 살다가" + 종료 작년 7월 → 2023-07~08월 추론 (월 단위) |
| `contract_end_date` | "작년 7월 말에 계약 끝났는데" |
| `deposit_amount` | "9천만원" |
| `unreturned_amount` | "한 푼도 못 받고" → 9천 전액 미반환 명시 |
| `has_moved_out` | "답답하게 살고 있어요" → false (거주 중) 추론 |
| `notice_method` | "문자랑 카톡" → [sms, kakao] |
| `landlord_responded` | "답을 안 해요" + "한 마디도 안 해요" → false |
| `has_kakao_records` | "카톡 여러 번 보냈어요" → true 추론 |

→ 8개 드러남, hidden = 16 − 8 = **8** → `medium` (7–10) 중앙 ✓

### 질문받아야 드러나는 정보 (숨겨진 8개)

| 슬롯 | GT value | 페르소나 발현 |
|---|---|---|
| `has_contract_doc` | true | 평범 |
| `has_resident_reg` | true | 평범 |
| `has_fixed_date` | true | 평범 |
| `notice_date` | 2025-06-01 | emotional 흐릿 ("작년 6월부터... 정확히는...") |
| `has_certified_mail` | false | "내용증명? 그건 시간이 없어서 못 보냈어요" |
| `has_transfer_records` | true | 평범 |
| `has_lien_registration` | false | "임차권등기? 들어봤는데 거주 중이라..." |
| `registry_check` | false | "그건 확인 못 했어요. 시간이 없어서요" |

---

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: 너무 화가 나서 어떻게 해야 할지 모르겠어요. 한 2년 동안 살다가 작년 7월 말에 계약 끝났는데, 끝나기 한참 전부터 보증금 9천만원 돌려달라고 문자랑 카톡 여러 번 보냈어요. 그런데 답을 안 해요. 진짜 한 마디도 안 해요. 한 푼도 못 받고 새 집도 못 알아보고 그냥 답답하게 살고 있어요.

수집(자동): `contract_start_date`(월), `contract_end_date`, `deposit_amount`, `unreturned_amount`, `has_moved_out`, `notice_method`, `landlord_responded`, `has_kakao_records`

### Turn 1 — 감정 인정과 계약서 확인

> **AI**: 답답하실 것 같아요. 정확한 상황을 정리하기 위해 몇 가지 더 여쭐게요. 임대차계약서 원본은 갖고 계신가요?
>
> **의뢰인**: 네, 있어요.

수집: `has_contract_doc` = true

### Turn 2 — 계약 시작일 정확화

> **AI**: 계약 시작일이 정확히 언제였을까요?
>
> **의뢰인**: 2023년 8월 1일이요. 끝난 게 작년 7월 31일이고요.

수집: `contract_start_date` = 2023-08-01 (정확화), `contract_end_date` = 2025-07-31

### Turn 3 — 전입신고와 확정일자

> **AI**: 전입신고와 확정일자는 받으셨나요?
>
> **의뢰인**: 네, 둘 다 했어요. 이사하고 다음 날 전입신고 했고 확정일자는 계약일에 받았어요.

수집: `has_resident_reg` = true, `has_fixed_date` = true

### Turn 4 — 통보 시점 정확화

> **AI**: 처음 문자를 보낸 게 언제였는지 기억나시나요?
>
> **의뢰인**: 하... 작년 6월부터였어요. 정확히는 6월 초쯤.

수집: `notice_date` = 2025-06-01

### Turn 5 — 내용증명

> **AI**: 카톡·문자 외에 내용증명을 보낸 적은 있나요?
>
> **의뢰인**: 그건 못 보냈어요. 3교대 근무라 시간이 너무 없고 절차도 정확히 모르겠어서요.

수집: `has_certified_mail` = false

### Turn 6 — 계좌이체 내역

> **AI**: 처음 보증금 입금하셨을 때 계좌이체 내역은 남아 있나요?
>
> **의뢰인**: 네, 은행 앱에 있어요.

수집: `has_transfer_records` = true

### Turn 7 — 임차권등기명령

> **AI**: 계약 끝난 후에 임차권등기명령을 신청해보신 적은 있나요?
>
> **의뢰인**: 들어보긴 했는데, 아직 거주 중이라 신청을 안 했어요.

수집: `has_lien_registration` = false

### Turn 8 — 등기부등본

> **AI**: 등기부등본을 확인해서 집주인 권리관계를 보신 적은 있나요?
>
> **의뢰인**: 그건 확인 못 했어요. 시간이 너무 없어서요.

수집: `registry_check` = false

### Turn 9 — 수집 완료 확인

> **AI**: 말해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 남기실 내용이 있나요?
>
> **의뢰인**: *(엄격+범위좁힘 규칙: `open_question_response`)*
>
> "지금 생각나는 건 없어요"

### 대화 종료 조건

- 체크리스트 16개 항목 전부 수집 완료
- 추가 법률 쟁점 없음 (v1 순수)
- 총 9~10턴 예상 (medium — 첫 발화 노출량 많아 빠른 진행)

---

## 3. 변환/설계 메모

1. **`emotional × medium` 정책 검증**: §2-3 medium 구간(hidden 7–10)에 정확히 8로 안착. emotional 페르소나가 medium에서는 first_utterance에 정보를 풍부하게 노출하면서도(8개 슬롯) 감정 톤 유지하는 것이 가능함을 보여주는 케이스. 002(high, 2문장 짧음)와 대비.

2. **`landlord_responded: false` 첫 진입 — 측정 측면**: 선례 7건 전부 true. 006이 첫 false 분기. 단일턴 baseline이 "답을 안 해요"를 `landlord_responded` 슬롯의 false로 정확히 매핑할 수 있는지가 측정 포인트. "응답 없음" vs "정보 없음(unknown)"의 구별 능력 평가. v2 issue_tag `landlord_no_response`의 사실관계 기반.

3. **`notice_method: [sms, kakao]` 시간 순서**: 처음 문자, 이후 카톡. 008은 `[kakao, phone]`. 24케이스 작성 시 다중 채널 조합 매트릭스 추적 필요 (현재 [sms,kakao], [kakao,phone] 2종).

4. **3교대 근무 설정의 다층 기능**: emotional 페르소나의 분노가 무응답 + 처리 시간 부족에서 자연스럽게 발현. proactive_speech_pool의 "3교대라 사람 만나는 시간이 너무 부족해요"가 `has_certified_mail: false`, `registry_check: false`의 정황적 근거. 페르소나 일관성 보강.

5. **`has_lien_registration: false`이지만 거주 중**: 임차권등기는 통상 퇴거 직전·후 신청. 거주 중이면 신청 안 한 게 자연스러움 (보증금 분쟁 진행 중인데 거주를 빠져나가야 신청 의미가 큼). 002(거주중, false)와 동일 패턴. moving_out_planned·moved_out 상태에서만 임차권등기가 의미 있다는 룰을 시나리오 메타로 추적.

6. **`expected_ia_turns 10`**: first_utterance 8개 자동 수집 + 나머지 8개 빠른 진행. 003(medium, 12턴)·004(medium, 10턴)와 비교 가능한 medium 페르소나별 턴 수 데이터.
