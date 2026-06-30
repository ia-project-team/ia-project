---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-06-30 (new v1 case — confused × medium_high)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-005
case_title: "부모님이 대신 처리한 대학원생 보증금 미반환"
schema_version: "0.1"
created_at: "2026-06-30"
last_updated: "2026-06-30"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: confused
difficulty: medium_high               # hidden 11-13 (§2-3 매핑)
move_out_status: moved_out
notice_method: [kakao]
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
# 본인이 모르거나 부모님이 처리한 슬롯 + v1 단일턴 누락 위험
risk_missing_points:
  - contract_start_date
  - fixed_date
  - notice_date
  - notice_recipient
  - certified_mail
  - leasehold_registration
  - registry_not_checked
  - landlord_response

# --- 4. 카운트 ---
hidden_info_count: 12   # first_utterance 4개 드러남 → hidden 12 → medium_high (11-13) 중앙
expected_ia_turns: 13

# --- 5. 페르소나 ---
persona:
  name: "한주영"
  age: 26
  occupation: "대학원생 (석사 과정)"
  residence_history: "서울 서대문구 원룸 전세 1년 거주"
  current_situation: "본인 명의 계약이지만 부모님이 전 과정을 대신 처리. 1년 계약 종료 후 이사 나왔으나 보증금 6천만원 미반환. 본인은 절차·통보·답변 내용을 정확히 모름"

# --- 6. 첫 발화 ---
first_utterance: |
  보증금 6천만원이 안 들어와요. 한 2년쯤 전에 계약했고 올해 초에 끝났는데,
  3월에 이사 나오면서 부모님이 카톡으로 집주인한테 얘기는 했어요.
  답은 받았는데 그게 그냥 알겠다는 건지 돈을 준다는 건지 잘 모르겠어요.
  저는 부모님이 다 처리해서 절차를 잘 몰라요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "부모님 댁에서 보관 중"
  contract_start_date:
    value: "2024-03-01"
    detail: "1년 계약 시작일"
  contract_end_date:
    value: "2025-02-28"
    detail: "1년 계약 만료일"
  deposit_amount:
    value: 60000000
    unit: KRW
    detail: "6천만원. 부모님 도움으로 마련"
  unreturned_amount:
    value: 60000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2024-03-03 전입신고 (부모님이 챙겨서 함)"
  has_fixed_date:
    value: false
    detail: "⭐ confused 본질 발현 슬롯. 부모님이 깜빡하고 확정일자 안 받음. 의뢰인 본인은 받았는지 안 받았는지 모름 — IA가 캐물어야 부모님께 확인 후 false 드러남"
  has_moved_out:
    value: true
    detail: "2025-03-15 새 자취방으로 이사"
  notice_date:
    value: "2025-01-15"
    detail: "계약 종료 약 한 달 반 전 부모님이 카톡 전송"
  notice_method:
    value: [kakao]
    detail: "부모님 폰에서 카톡으로 통보. 본인 명의 계약이지만 통보 주체는 부모님"
  landlord_responded:
    value: true
    detail: "'알아보겠다' 정도의 모호한 답변. 이후 추가 연락 없음"
  has_kakao_records:
    value: true
    detail: "⭐ 본인 폰에는 없고 부모님 폰에 있음. 의뢰인 시점에서 즉시 답하기 어려운 슬롯"
  has_certified_mail:
    value: false
    detail: "내용증명 발송 안 함. 의뢰인은 절차 자체를 모름"
  has_transfer_records:
    value: true
    detail: "부모님 명의 계좌에서 이체. 본인이 확인 가능한 형태"
  has_lien_registration:
    value: false
    detail: "임차권등기 제도 모름. 이미 이사 완료 상태"
  registry_check:
    value: false
    detail: "등기부등본 확인 안 함"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: low           # confused — 날짜 흐릿
    amount_precision: low         # 보증금 액수 외 흐릿
    emotion_level: medium         # confused 톤 (§2-2)
    uncertainty_phrases:
      - "그게 뭐예요?"
      - "부모님한테 물어봐야..."
      - "그건 잘 모르겠는데..."
      - "어떻게 해야 되는 건지..."
  proactive_speech_pool:
    - "학교 다니면서 알아보기가 어려워요"
    - "부모님이 다 챙겨주셔서 저는 잘 몰라요"
    - "이런 건 처음이라 막막해요"
    - "어디서부터 알아봐야 할지 모르겠어요"
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 부모님이 대신 처리한 대학원생 보증금 미반환

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 한주영 (26세)
- **직업**: 대학원생 (석사 과정)
- **거주 이력**: 서울 서대문구 원룸 전세 1년 거주
- **현재 상황**: 본인 명의 계약이지만 부모님이 전 과정을 대신 처리. 1년 계약 종료 후 이사 나왔으나 6천만원 미반환. 본인은 절차·통보·답변 내용을 정확히 모름

### 이 케이스의 특징 (다른 케이스와의 차별점)

- **`confused × medium_high` 첫 진입**: 003(`confused × medium`)과 같은 페르소나의 더 어려운 변형. medium_high(hidden 11-13) 검증
- **본인 명의 vs 실제 처리 주체 분리**: 계약 주체는 본인이지만 부모님이 모든 절차 대행. confused 본질이 "내가 한 게 아니라 잘 모름"으로 발현. `risk_missing_points: notice_recipient` 발현 (통보 주체 불명확)
- **`has_kakao_records: true`인데 본인 폰엔 없음**: confused 본질 발현 슬롯. boolean true 추출이 까다로움 — 본인 시점 답변과 객관 GT가 다를 수 있음
- **`has_fixed_date: false`인데 본인이 받았는지 모름**: 본인 모름 + 부모님이 깜빡 = 진정한 불이익. boolean 추출의 어려움
- **1년 단기 전세 첫 사용**: 선례 6건(1~4년 중 2년·4년만 사용)과 차별
- **모든 권리 보전 슬롯 false**: 임차권등기 false + 내용증명 false + 등기부 확인 false. 사회 경험 부족한 대학원생의 전형

### first_utterance에서 드러나는 정보 (4개)

| 슬롯 | 드러남 근거 |
|---|---|
| `deposit_amount` | "6천만원" |
| `has_moved_out` | "이사 나오면서" → true |
| `notice_method` | "카톡으로" → [kakao] |
| `landlord_responded` | "답은 받았는데" → true |

→ 4개 드러남, hidden = 16 − 4 = **12** → `medium_high` (11–13) 중앙 ✓

> 참고: "한 2년쯤 전에 계약"과 "올해 초에 끝났는데"는 시점 추론이 모호(confused 페르소나의 시제 흐릿)하여 `contract_start_date`·`contract_end_date` 모두 미드러남으로 카운트. "6천만원이 안 들어와요"는 `deposit_amount`만 보증금 액수로 드러나고 `unreturned_amount`(전액 vs 부분)는 미드러남.

### 질문받아야 드러나는 정보 (숨겨진 12개)

| 슬롯 | GT value | 페르소나 발현 |
|---|---|---|
| `has_contract_doc` | true | "네, 부모님 댁에 있어요" |
| `contract_start_date` | 2024-03-01 | ⭐ "음... 작년 3월쯤이었나... 부모님한테 물어봐야..." |
| `contract_end_date` | 2025-02-28 | ⭐ "올해 2월 말이요... 정확히는 잘..." |
| `unreturned_amount` | 60,000,000 | "한 푼도 못 받았어요" |
| `has_resident_reg` | true | "부모님이 했다고 했어요" |
| **`has_fixed_date`** | **false** | ⭐⭐ confused 핵심 — "그게 뭐예요? 받은 것 같기도 하고... 부모님한테 확인해봐야 해요" |
| `notice_date` | 2025-01-15 | ⭐ "1월 중순쯤이라고 했어요... 정확히는..." |
| **`has_kakao_records`** | **true** | ⭐⭐ confused — "제 폰엔 없는데 부모님 폰엔 있을 거예요" |
| `has_certified_mail` | false | ⭐ "내용증명이요? 그게 뭐예요? 안 한 것 같아요" |
| `has_transfer_records` | true | "부모님 계좌에서 보낸 건데 내역은 있어요" |
| `has_lien_registration` | false | ⭐ "임차권등기? 그건 뭐예요?" |
| `registry_check` | false | "그건 안 봤어요" |

---

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: 보증금 6천만원이 안 들어와요. 한 2년쯤 전에 계약했고 올해 초에 끝났는데, 3월에 이사 나오면서 부모님이 카톡으로 집주인한테 얘기는 했어요. 답은 받았는데 그게 그냥 알겠다는 건지 돈을 준다는 건지 잘 모르겠어요. 저는 부모님이 다 처리해서 절차를 잘 몰라요.

수집(자동): `deposit_amount`, `has_moved_out`, `notice_method`, `landlord_responded`

### Turn 1 — 계약서·계약 시점 정확화

> **AI**: 임대차계약서는 갖고 계신가요? 계약 시작일과 종료일을 정확히 알려주실 수 있을까요?
>
> **의뢰인**: 계약서는 부모님 댁에 있어요. 음... 작년 3월쯤 시작했고 올해 2월 말에 끝났어요. 정확한 날짜는 부모님한테 물어봐야 해요.

수집: `has_contract_doc` = true, `contract_start_date` = 2024-03-01, `contract_end_date` = 2025-02-28

### Turn 2 — 미반환 금액 확인

> **AI**: 보증금 6천만원이 전액 미반환인가요, 아니면 일부만 받으셨나요?
>
> **의뢰인**: 한 푼도 못 받았어요.

수집: `unreturned_amount` = 60,000,000

### Turn 3 — 전입신고

> **AI**: 계약 당시 전입신고는 하셨나요?
>
> **의뢰인**: 부모님이 해주셨다고 했어요. 이사하고 며칠 안에 했다고...

수집: `has_resident_reg` = true

### Turn 4 — 확정일자 (confused 핵심 발현)

> **AI**: 확정일자도 받으셨나요?
>
> **의뢰인**: 확정일자요? 그게 뭐예요? 받은 것 같기도 하고... 잘 모르겠어요. 부모님한테 확인해봐야 해요.

수집(임시): `has_fixed_date` = unknown → IA가 추가 명확화 또는 false로 잡음

*(비고: ⭐⭐ confused 본질 핵심 — 본인이 받았는지 안 받았는지 모름. 실제 GT는 false. `risk_missing_points: fixed_date` 발현. 단일턴 baseline은 이 슬롯을 unknown으로 흘릴 가능성이 매우 높음)*

### Turn 5 — 통보 시점 정확화

> **AI**: 부모님이 카톡으로 보낸 게 언제쯤이었는지 기억나시나요?
>
> **의뢰인**: 1월 중순쯤이라고 했어요. 정확히는 잘...

수집: `notice_date` = 2025-01-15

### Turn 6 — 카톡 기록 (confused 핵심 발현)

> **AI**: 그 카톡 기록은 지금도 보실 수 있나요?
>
> **의뢰인**: 제 폰엔 없는데 부모님 폰엔 있을 거예요. 부모님이 보낸 거라서요.

수집: `has_kakao_records` = true

*(비고: ⭐⭐ confused 본질 — boolean 추출이 까다로운 슬롯. IA가 "부모님 폰에 있으면 보유"로 판단해야 true. 단일턴 baseline은 "본인 폰엔 없다"는 답변을 false로 잘못 잡을 가능성)*

### Turn 7 — 내용증명 (confused 발현)

> **AI**: 카톡 외에 내용증명을 보낸 적은 있나요?
>
> **의뢰인**: 내용증명이요? 그게 뭐예요? 안 한 것 같아요.

수집: `has_certified_mail` = false

### Turn 8 — 계좌이체 내역

> **AI**: 처음 보증금을 입금하셨을 때 계좌이체 내역은 남아 있나요?
>
> **의뢰인**: 부모님 계좌에서 보낸 거지만 내역은 있어요.

수집: `has_transfer_records` = true

### Turn 9 — 임차권등기명령 (confused 발현)

> **AI**: 이사 나가시기 전에 임차권등기명령을 신청하신 적이 있나요?
>
> **의뢰인**: 임차권등기? 그건 뭐예요? 그런 건 안 한 것 같은데...

수집: `has_lien_registration` = false

### Turn 10 — 등기부등본

> **AI**: 등기부등본을 확인해서 집주인 권리관계를 보신 적이 있나요?
>
> **의뢰인**: 아니요, 그건 안 봤어요.

수집: `registry_check` = false

### Turn 11 — 집주인 답변 세부 확인

> **AI**: 처음에 부모님이 카톡 보냈을 때 집주인 답변이 정확히 어떤 내용이었는지 아실까요?
>
> **의뢰인**: "알아보겠다" 정도였다고 했어요. 그 뒤로는 별 연락이 없었어요.

수집(검증): `landlord_responded` = true (세부 검증, `risk_missing_points: landlord_response` 발현)

### Turn 12 — 수집 완료 확인

> **AI**: 말해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 남기실 내용이 있나요?
>
> **의뢰인**: *(엄격+범위좁힘 규칙: `open_question_response`)*
>
> "지금 생각나는 건 없어요"

### 대화 종료 조건

- 체크리스트 16개 항목 전부 수집 완료
- 추가 법률 쟁점 없음 (v1 순수)
- 총 12~13턴 예상 (medium_high — confused 명확화 + 본인 비처리 슬롯 재확인)

---

## 3. 변환/설계 메모

1. **`confused × medium_high` 정책 검증**: §2-3 medium_high 구간(hidden 11–13)에 정확히 12로 안착. first_utterance에 4개 슬롯이 노출되며 모두 boolean 또는 액수 1개. 시제 표현이 흐릿("한 2년쯤 전", "올해 초")하여 `contract_start_date`·`contract_end_date` 미드러남. 페르소나 본질(시제 흐릿)이 difficulty 상승에 기여.

2. **`has_fixed_date`의 confused 본질 발현 (Turn 4)**: 본인이 받았는지 안 받았는지 모름. 실제 GT는 false. 단일턴 baseline은 이 슬롯을 unknown으로 흘리거나 true로 잘못 잡을 가능성이 매우 높음 — IA가 명확화 질문으로 false를 끌어내는 능력이 핵심 변별. 003의 `registry_check` 이중성(true이나 이해 X)과 대비되는, 본인 미인지로 인한 답변 모호성.

3. **`has_kakao_records`의 confused 본질 (Turn 6)**: boolean true 추출이 까다로운 첫 케이스. 본인 폰엔 없고 부모님 폰에 있음. IA가 "부모님 폰에 있으면 보유로 본다"는 판단을 내려야 GT와 일치. 단일턴 baseline은 "제 폰엔 없어요"를 false로 잡을 가능성. 평가 측면: Code Evaluator가 의뢰인의 모호한 답변과 IA의 해석을 어떻게 다룰지 룰 필요.

4. **`notice_recipient` risk_missing_point의 발현**: 본인 명의 계약 vs 통보 주체 부모님의 분리. v1 순수이지만 단일턴 baseline은 통보 주체를 본인으로 잘못 가정할 가능성. v2 issue_tag `unclear_notice_recipient`의 사실관계 기반이 되는 케이스.

5. **1년 단기 전세 첫 사용**: 선례 6건 대비 차별. 단기 계약은 대학원생·취준생 페르소나에 자연스러움. 24케이스 작성 시 단기 전세 비중 모니터링.

6. **`expected_ia_turns 13`**: medium_high이지만 confused 페르소나의 본인 미인지 슬롯이 다수(Turn 4, 6, 11에서 명확화)라 high 케이스(13턴)와 같음. 페르소나·difficulty 조합별 턴 수가 단순 difficulty만으로 결정되지 않음을 보여주는 데이터.
