---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-06-30 (new v1 case — confused × medium, medium 칸 첫 진입)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-003
case_title: "이사 예정 자영업자 - 자동연장 혼동 보증금 미반환"
schema_version: "0.1"
created_at: "2026-06-30"
last_updated: "2026-06-30"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: confused
difficulty: medium                    # hidden_info_count 7-10 (§2-3 매핑)
move_out_status: moving_out_planned
notice_method: [phone]
evidence_items:
  - contract_doc
  - transfer_records
  - registry_doc
evaluation_purpose:
  - golden_set
  - checklist_recall
  - single_turn_comparison

# --- 3. 평가 분류 ---
# v1 순수 케이스 (의뢰인의 자동연장 혼란은 본인 혼동이지 실제 법률 쟁점이 아니므로 issue_tags 비움)
issue_tags: []
# confused 페르소나가 헷갈려하는 지점 + v1 단일턴 누락 위험
risk_missing_points:
  - contract_start_date
  - resident_registration
  - fixed_date
  - notice_date
  - notice_method
  - notice_method_validity
  - registry_details_unclear
  - leasehold_registration
  - certified_mail

# --- 4. 카운트 ---
hidden_info_count: 10    # first_utterance에 6개 드러남 → hidden 10 → medium (7-10) 상단
expected_ia_turns: 12

# --- 5. 페르소나 ---
persona:
  name: "강민호"
  age: 38
  occupation: "자영업자 (작은 카페 운영)"
  residence_history: "인천 부평구 빌라 전세 2년 거주"
  current_situation: "2년 전세 계약 종료 후 보증금 1억 5천만원 전액 미반환. 곧 이사 예정이나 법적 절차를 잘 몰라 자동연장 여부와 통보 방식 유효성을 혼동하고 있음"

# --- 6. 첫 발화 ---
first_utterance: |
  이거 어떻게 해야 하는 건지 잘 모르겠어요. 계약이 5월에 끝났는데
  집주인이 사정이 있다고 한 달만 더 기다려달라고 해서요.
  그게 자동연장이 되는 건지 그냥 미루는 건지 헷갈리고...
  저는 곧 이사 가야 해서요. 보증금 1억 5천 받아야 다음 집 갈 수 있는데
  집주인이 답은 해줘서 그게 통보가 된 건가 싶기도 하고요.
  등기부등본은 한 번 떼봤는데 뭐가 적혀있는지 잘 모르겠더라고요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2023-06-01"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2025-05-31"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 150000000
    unit: KRW
    detail: "1억 5천만원"
  unreturned_amount:
    value: 150000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2023-06-02 전입신고 (당시에는 부동산이 알려줘서 했음)"
  has_fixed_date:
    value: true
    detail: "2023-06-01 확정일자 부여 (계약일 당일 받음)"
  has_moved_out:
    value: false
    detail: "아직 거주 중. 새 집 알아보는 중이며 곧 이사 예정 (moving_out_planned)"
  notice_date:
    value: "2025-04-20"
    detail: "계약 종료 약 한 달 전 전화로 통보"
  notice_method:
    value: [phone]
    detail: "전화로만 통보. 카톡·문자·내용증명 일절 사용 안 함"
  landlord_responded:
    value: true
    detail: "전화 통화에서 '사정이 있으니 한 달만 더 기다려달라'고 답변. 통화 녹음은 없음"
  has_kakao_records:
    value: false
    detail: "카톡으로 보증금 얘기한 적 없음"
  has_certified_mail:
    value: false
    detail: "내용증명이 뭔지 잘 모름. 발송 안 함"
  has_transfer_records:
    value: true
    detail: "계약 시 보증금 입금한 계좌이체 내역 은행 앱에 남아 있음"
  has_lien_registration:
    value: false
    detail: "임차권등기명령 제도 자체를 모름. 신청 안 함"
  registry_check:
    value: true
    detail: "⭐ confused 본질 발현 슬롯. 등기부등본을 한 번 떼봤으나 근저당·소유자 변경 등 세부 내용을 이해하지 못함. 확인은 했으므로 boolean은 true이나 risk_missing_points의 registry_details_unclear와 함께 다룸"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: low           # confused — 날짜 흐릿하게 답함
    amount_precision: low         # 보증금 액수 외에는 흐릿
    emotion_level: medium         # confused 톤 (§2-2 매핑)
    uncertainty_phrases:
      - "그게 뭐예요?"
      - "그건 잘 모르겠는데..."
      - "그게... 잘..."
      - "어떻게 해야 되는 건지..."
      - "그런 것도 해야 되는 건가요?"
  proactive_speech_pool:
    # confused 본질을 보조하는 정황 발화 — GT 16슬롯 정보 직접 노출 없음
    - "이런 일은 처음이라 어떻게 해야 할지 모르겠어요"
    - "법적인 건 잘 몰라서요"
    - "주변에서는 빨리 해결해야 한다고 하는데 뭘 해야 하는지 모르겠어요"
    - "이게 그냥 기다리면 되는 건지 아니면 뭔가 해야 하는 건지 헷갈려요"
    - "장사하느라 시간 내기가 어려워요"
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 이사 예정 자영업자 자동연장 혼동

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 강민호 (38세)
- **직업**: 자영업자 (작은 카페 운영)
- **거주 이력**: 인천 부평구 빌라 전세 2년 거주
- **현재 상황**: 2년 전세 종료 후 보증금 1억 5천만원 전액 미반환. 곧 이사 예정이나 자동연장 여부, 통보 유효성, 등기부 세부 내용을 혼동하고 있음

### 이 케이스의 특징 (다른 케이스와의 차별점)

- **`confused × medium` 첫 진입**: 분포 그리드의 `confused` 행 첫 케이스이자 `medium` 칸 첫 케이스. medium 정책(hidden 7–10) 검증
- **`moving_out_planned` 상태 첫 사용**: 선례 4개는 `living_in_property`와 `moved_out` 두 상태만 사용 중. 제3 상태(이사 예정) 진입
- **`notice_method: [phone]` 단독**: 전화로만 통보 + 통화 녹음 없음 = 객관적 통보 증거가 거의 없는 구성. 그러나 의뢰인이 그 약점을 자각 못 하는 게 confused 본질
- **`registry_check: true`인데 세부 내용 이해 못함**: confused 본질의 핵심 발현 슬롯. boolean은 true지만 의뢰인은 "근저당이 뭐예요?"류 답변. `risk_missing_points: registry_details_unclear`와 짝
- **자동연장 혼동은 묵시적 갱신 쟁점이 아님**: 의뢰인이 "자동연장이 되는 건지" 헷갈리는 건 본인 혼란일 뿐, 실제로는 계약 만료 후 일시적인 거주 연장에 가까움. `issue_tags`는 빈 배열로 유지 (v1 순수)

### first_utterance에서 드러나는 정보 (6개)

| 슬롯 | 드러남 근거 |
|---|---|
| `contract_end_date` | "계약이 5월에 끝났는데" → 종료일 월 단위 추론 가능 |
| `deposit_amount` | "1억 5천" |
| `unreturned_amount` | "받아야 다음 집 갈 수 있는데" → 전액 미반환 추론 |
| `has_moved_out` | "곧 이사 가야 해서" → false(아직 거주) 추론 |
| `landlord_responded` | "집주인이 답은 해줘서" |
| `registry_check` | "등기부등본은 한 번 떼봤는데" |

→ 6개 드러남, hidden = 16 − 6 = **10** → `medium` (7–10) 상단 ✓

### 질문받아야 드러나는 정보 (숨겨진 10개)

| 슬롯 | GT value | 페르소나 발현 |
|---|---|---|
| `has_contract_doc` | true | 평범하게 답변 |
| `contract_start_date` | 2023-06-01 | 날짜 흐릿 ("2023년 6월쯤이요...") |
| `has_resident_reg` | true | 평범 ("부동산에서 하라고 해서 했어요") |
| `has_fixed_date` | true | 평범 ("계약하던 날 받았던 것 같아요") |
| `notice_date` | 2025-04-20 | 흐릿 ("4월 말쯤... 정확히는...") |
| `notice_method` | [phone] | ⭐ confused — "전화로 했어요. 근데 그게 통보가 맞는지..." |
| `has_kakao_records` | false | "카톡으로는 안 했어요" |
| `has_certified_mail` | false | ⭐ "내용증명이요? 그게 뭐예요?" |
| `has_transfer_records` | true | "처음 입금한 건 은행 앱에 있어요" |
| `has_lien_registration` | false | ⭐ "임차권등기? 그건 처음 들어봐요" |
| **`registry_check` 세부** | (boolean은 true지만 내용 이해 X) | ⭐⭐ confused 핵심 — "떼봤는데 뭐가 적혀있는지... 근저당이 뭐예요?" |

---

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: 이거 어떻게 해야 하는 건지 잘 모르겠어요. 계약이 5월에 끝났는데 집주인이 사정이 있다고 한 달만 더 기다려달라고 해서요. 그게 자동으로 연장이 되는 건지 그냥 미루는 건지 헷갈리고... 저는 곧 이사 가야 해서요. 보증금 1억 5천 받아야 다음 집 갈 수 있는데 집주인이 답은 해줘서 그게 통보가 된 건가 싶기도 하고요. 등기부등본은 한 번 떼봤는데 뭐가 적혀있는지 잘 모르겠더라고요.

수집(자동): `contract_end_date`(월), `deposit_amount`, `unreturned_amount`, `has_moved_out`, `landlord_responded`, `registry_check`

### Turn 1 — 계약서 확인

> **AI**: 우선 임대차계약서 원본은 갖고 계신가요?
>
> **의뢰인**: 네, 있어요.

수집: `has_contract_doc` = true

### Turn 2 — 계약 시작일과 종료일 정확화

> **AI**: 계약서에 적힌 계약 시작일과 종료일이 정확히 언제인지 알려주실 수 있을까요?
>
> **의뢰인**: 음... 2023년 6월쯤 시작했고 올해 5월 말에 끝났어요. 정확한 날짜는 계약서 봐야 할 것 같아요.

수집: `contract_start_date` = 2023-06-01, `contract_end_date` = 2025-05-31 (정확화)

### Turn 3 — 전입신고와 확정일자

> **AI**: 계약 당시 전입신고와 확정일자는 받으셨나요?
>
> **의뢰인**: 부동산에서 하라고 해서 둘 다 한 것 같아요. 전입신고는 이사하고 다음 날인가 했고, 확정일자는 계약하던 날 받았던 것 같아요.

수집: `has_resident_reg` = true, `has_fixed_date` = true

### Turn 4 — 통보 시점 정확화

> **AI**: 집주인에게 계약 종료 또는 보증금 반환 요청을 언제 처음 말씀하셨나요?
>
> **의뢰인**: 4월 말쯤이었던 것 같아요. 정확히 며칠인지는... 잘 모르겠는데.

수집: `notice_date` = 2025-04-20 (대략)

### Turn 5 — 통보 방식 (confused 본질 발현)

> **AI**: 그 요청은 어떤 방식으로 전달하셨나요? 카톡, 문자, 전화 중 어떤 거였을까요?
>
> **의뢰인**: 전화로 했어요. 근데 그게 통보가 맞는지... 그냥 말로만 한 거라서요. 그런 것도 통보로 치는 건가요?

수집: `notice_method` = [phone]

*(비고: confused 본질 — 통보 방식의 효력에 대한 혼동. `risk_missing_points: notice_method_validity` 발현)*

### Turn 6 — 카톡 기록

> **AI**: 집주인과 카톡이나 문자로 보증금 얘기를 나눈 적이 있나요?
>
> **의뢰인**: 아니요, 그런 건 없어요. 전화로만 했어요.

수집: `has_kakao_records` = false

### Turn 7 — 내용증명 (confused 본질 발현)

> **AI**: 내용증명 우편을 보낸 적은 있으신가요?
>
> **의뢰인**: 내용증명이요? 그게 뭐예요? 그런 건 안 한 것 같은데...

수집: `has_certified_mail` = false

### Turn 8 — 계좌이체 내역

> **AI**: 처음 보증금을 입금하셨을 때 계좌이체 내역은 남아 있나요?
>
> **의뢰인**: 네, 은행 앱에 있어요.

수집: `has_transfer_records` = true

### Turn 9 — 임차권등기명령 (confused 본질 발현)

> **AI**: 이사 나가시기 전에 임차권등기명령을 신청하실 계획이 있으신가요?
>
> **의뢰인**: 그게... 그런 것도 해야 되는 건가요? 처음 들어봐요.

수집: `has_lien_registration` = false

*(비고: confused 페르소나가 권리 보전 절차에 대해 인지 자체가 없음 — single-turn baseline이 가장 놓치기 쉬운 슬롯)*

### Turn 10 — 등기부등본 세부 내용 (confused 핵심 발현)

> **AI**: 등기부등본을 보셨다고 하셨는데, 거기에 집주인 변경이나 근저당권 같은 내용이 있었나요?
>
> **의뢰인**: 떼서 보긴 했는데 뭐가 적혀있는지 잘 모르겠더라고요. 근저당이 뭐예요? 그런 것도 봐야 되는 거예요?

수집: `registry_check` = true (이미 Turn 0에서 수집됨, 여기서는 세부 검증)

*(비고: ⭐⭐ confused 본질의 핵심 발현 슬롯. boolean은 true이지만 의뢰인은 세부 내용 이해 없음. IA는 boolean만 수집하고 마지막 리포트에 `risk_missing_points: registry_details_unclear`로 플래그)*

### Turn 11 — 수집 완료 확인

> **AI**: 말해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 남기실 내용이 있나요?
>
> **의뢰인**: *(엄격+범위좁힘 규칙: `open_question_response`)*
>
> "지금 생각나는 건 없어요"

### 대화 종료 조건

- 체크리스트 16개 항목 전부 수집 완료
- 추가 법률 쟁점 없음 (v1 순수)
- 총 11~12턴 예상 (medium 난이도 — confused 명확화 턴 포함)

---

## 3. 변환/설계 메모

1. **`confused × medium` 정책 첫 검증**: §2-3 medium 구간(hidden 7–10)에 정확히 상단(10)으로 안착. first_utterance에 6개 슬롯이 노출되되 구체값은 보증금 액수 1개뿐(나머지는 boolean 방향 추론). 페르소나 본질(상황 오해, 되물음)은 first_utterance의 어투("헷갈리고", "싶기도 하고요")와 후속 답변의 uncertainty_phrases("그게 뭐예요?", "그런 것도 해야 되는 건가요?")에서 발현.

2. **`registry_check`의 이중성 — confused 본질 핵심 발현 슬롯**: boolean(true)과 세부 이해(없음)가 분리되는 첫 케이스. 평가 측면에서는 `collected[].registry_check`가 true로 수집되면 슬롯 단위 평가는 성공이나, 단일턴 baseline 비교 시 "GPT/Claude가 의뢰인의 세부 이해 부족을 감지하고 후속 질문으로 끌어내는지"가 변별 포인트. risk_missing_points의 `registry_details_unclear`가 이 차이를 표면화.

3. **`notice_method: [phone]` + `landlord_responded: true` + 녹음 없음**: 통보와 답변 모두 있으나 객관적 증거 없음 구성. v2 issue_tags의 `weak_notice_evidence`에 해당할 수 있는 사실관계지만 v1 케이스이므로 `issue_tags`는 비움. 대신 `risk_missing_points`에 `notice_method_validity` 포함하여 단일턴 baseline 비교 시 "통보 방식 효력 인지"를 측정 대상으로 둠.

4. **자동연장 혼동 vs 묵시적 갱신 쟁점**: 의뢰인이 first_utterance에서 "자동으로 연장이 되는 건지 그냥 미루는 건지 헷갈리고"라고 표현하지만, GT 상으로는 단순 계약 만료 후 일시 거주 연장이다. 묵시적 갱신(`implied_renewal`)으로 분류하지 않고 `issue_tags: []`로 v1 유지. 24개 작성 시 의뢰인 혼란 vs 실제 법률 쟁점을 분리하는 룰을 일관 적용.

5. **`moving_out_planned` 상태 첫 사용**: 분포 §2-4-2 부차 분포 목표(8/12/6/4 중 6 위치)에 1건 진입. 이 상태에서 `has_moved_out: false`이면서 `has_lien_registration: false`이면 임차권등기 미신청 위험이 큰 사실관계 — 향후 medium_high·high 작성 시 이 조합을 issue_tags `no_leasehold_registration`(v2)으로 발전시킬 여지 있음.

6. **expected_ia_turns 12**: medium 난이도이지만 confused 페르소나의 명확화 턴(Turn 5의 통보 방식 효력 되묻기, Turn 7의 내용증명 정의 묻기, Turn 9의 임차권등기 인지 부재, Turn 10의 등기부 세부 확인)이 누적되어 high 케이스(13턴)와 거의 비슷. medium 페르소나별 턴 수 비교 데이터로 활용 가능.
