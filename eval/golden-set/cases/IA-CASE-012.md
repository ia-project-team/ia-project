---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-01 (new v1 case — over_explaining × low)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-012
case_title: "학원장의 잡음 섞인 절차 진행 - 산만한 정보 노출"
schema_version: "0.1"
created_at: "2026-07-01"
last_updated: "2026-07-01"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: over_explaining
difficulty: low                       # hidden 0-6 (§2-3)
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
issue_tags: []
# 산만한 정황 속에 묻힌 슬롯 + 미이행 절차
risk_missing_points:
  - resident_registration
  - fixed_date
  - certified_mail
  - registry_check

# --- 4. 카운트 ---
hidden_info_count: 4    # first_utterance 12개 드러남 → hidden 4 → low (0-6)
expected_ia_turns: 7

# --- 5. 페르소나 ---
persona:
  name: "배윤미"
  age: 45
  occupation: "학원장 (20년 경력, 대구 수성구 소재)"
  residence_history: "대구 수성구 아파트 전세 2년 거주"
  current_situation: "2년 계약 종료 후 보증금 2.1억 전액 미반환. 5월 중순 전화로 통보했으나 집주인은 '정리 중' 답변만 반복. 학원장 언니 조언과 부동산 카페 정보를 혼재해 정황이 산만함. 이사 예정"

# --- 6. 첫 발화 ---
first_utterance: |
  아 그게 그러니까 제가 학원을 대구에서 20년 넘게 하고 있는데 학원생들이
  요즘 부동산 상속 얘기 많이 하고 그래서 저도 신경이 많이 쓰였거든요.
  그건 그렇고 지금 사는 데가 대구 수성구 아파트인데 2023년 7월 1일부터
  2년 계약이었고 6월 30일에 끝났어요. 보증금은 2억 1천만원인데 전액을 못
  받았고요. 그때 이사 오면서 옆에 학원장 언니가 부동산 잘 안다고 해서
  그 사람이 소개해준 부동산에서 계약했어요. 5월 중순에 처음 전화로 집주인한테
  얘기했고 "정리 중이니 걱정 마세요"라고 답은 했는데 그 뒤로 진전이 없어서요.
  카톡이나 문자는 안 했어요, 저는 전화가 더 편해서요. 계좌이체 내역이랑
  계약서는 갖고 있고 아직 이사는 안 했는데 나가려고 준비하고 있어요.
  임차권등기? 그건 뭔지 잘 모르겠는데 학원장 언니가 그런 것도 있다고는
  하더라고요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2023-07-01"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2025-06-30"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 210000000
    unit: KRW
    detail: "2억 1천만원"
  unreturned_amount:
    value: 210000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2023-07-05 전입신고 (부동산 사장 안내로 이사 직후)"
  has_fixed_date:
    value: true
    detail: "2023-07-05 확정일자 부여"
  has_moved_out:
    value: false
    detail: "이사 준비 중이나 보증금 문제로 지연. moving_out_planned"
  notice_date:
    value: "2025-05-15"
    detail: "계약 종료 약 한 달 반 전 전화로 통보"
  notice_method:
    value: [phone]
    detail: "전화 단독. 카톡·문자 미사용. 003과 동일 채널이나 정황 다름 (003은 자영업자 혼동, 012는 학원장 산만)"
  landlord_responded:
    value: true
    detail: "'정리 중이니 걱정 마세요'라고 답. 이후 구체 진전 없음"
  has_kakao_records:
    value: false
    detail: "집주인과 카톡 자체를 안 씀"
  has_certified_mail:
    value: false
    detail: "⭐ 내용증명 방법 자체를 몰라 미발송"
  has_transfer_records:
    value: true
    detail: "보증금 입금 이체 내역 은행에서 확인 가능"
  has_lien_registration:
    value: false
    detail: "학원장 언니에게 들었으나 아직 거주 중이라 미신청"
  registry_check:
    value: true
    detail: "지난주 등기부등본 확인. 소유자는 그대로였음"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: medium        # over_explaining (§2-2)
    amount_precision: medium
    emotion_level: medium
    uncertainty_phrases:
      - "아 그게 그러니까..."
      - "그거 말씀하시는 게..."
      - "이야기가 좀 긴데..."
      - "그건 저희 학원장 언니가..."
  proactive_speech_pool:
    # over_explaining 정황 — GT 슬롯 정보 노출 없음
    - "학원 애들 신경 쓰느라 이런 것도 챙기기가 어려워요"
    - "학원장 언니가 자기 아는 변호사 소개해준다고는 했는데 부담이라서요"
    - "20년 학원 하면서 이런 일은 처음이에요"
    - "예전에 살던 곳에서는 이런 문제 없었거든요"
    - "요즘은 부동산 카페 들어가서 정보 얻고 있어요"
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 학원장의 잡음 섞인 절차 진행

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 배윤미 (45세)
- **직업**: 학원장 (20년 경력, 대구 수성구 소재)
- **거주 이력**: 대구 수성구 아파트 전세 2년 거주
- **현재 상황**: 이사 예정이나 보증금 2.1억 전액 미반환으로 지연. 학원장 언니 조언과 부동산 카페 정보 혼재

### 이 케이스의 특징 (다른 케이스와의 차별점)

- **`over_explaining × low` 첫 진입**: 008(over_explaining × high, 4문장 정황 위주)과 정보량 스펙트럼 반대 극점. 같은 페르소나의 양 끝점 표본 확보
- **산만한 정황 속에 슬롯 노출**: 학원 이야기·학원장 언니 조언·부동산 카페 언급이 GT 사이사이 삽입됨. IA가 잡음 필터링 필요
- **`notice_method: [phone]` 단독 두 번째**: 003(자영업자)에 이어 두 번째. 003(50대 남성 confused)과 완전 다른 페르소나(45세 여성 over_explaining)에서 같은 채널 사용
- **`moving_out_planned` 세 번째**: 003·009에 이어 세 번째. 부차 분포 목표 6건 중 3건 확보
- **대구 수성구**: 지역 신규 진입 (선례 서울·부산·인천·대전·광주)
- **첫 발화 극도로 김 (약 10문장)**: fragmented 010(단문 나열)과 정반대 스타일. 같은 low이지만 페르소나에 따라 first_utterance 길이·구조 완전 다름
- **`has_lien_registration: false`이지만 인지는 있음**: "학원장 언니가 그런 것도 있다고는 하더라고요" — 인지 O + 미신청. 011(인지 X + 미신청)과 대비. `moving_out_planned` 상태에서 자연스러움

### first_utterance에서 드러나는 정보 (12개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_contract_doc` | "계약서는 갖고 있고" |
| `contract_start_date` | "2023년 7월 1일부터" |
| `contract_end_date` | "6월 30일에 끝났어요" |
| `deposit_amount` | "2억 1천만원" |
| `unreturned_amount` | "전액을 못 받았고요" |
| `has_moved_out` | "아직 이사는 안 했는데 나가려고 준비하고 있어요" → false + moving_out_planned |
| `notice_date` | "5월 중순" |
| `notice_method` | "전화로" → [phone] |
| `landlord_responded` | "'정리 중이니 걱정 마세요'라고 답은 했는데" |
| `has_kakao_records` | "카톡이나 문자는 안 했어요" → false |
| `has_transfer_records` | "계좌이체 내역이랑" |
| `has_lien_registration` | "학원장 언니가 그런 것도 있다고는 하더라고요" → false 추론 (미신청) |

→ 12개 드러남, hidden = 16 − 12 = **4** → `low` (0-6) ✓

> 참고: `has_resident_reg`, `has_fixed_date`, `has_certified_mail`, `registry_check`는 산만한 발화에 언급 안 됨 — over_explaining 정황이 GT를 잡음 속에 묻은 결과.

### 질문받아야 드러나는 정보 (숨겨진 4개)

| 슬롯 | GT value | 페르소나 발현 |
|---|---|---|
| `has_resident_reg` | true | "아 네, 전입신고요. 부동산 사장님이 이사 직후에 하라고 해서 했어요" (부수 정보 섞임) |
| `has_fixed_date` | true | "확정일자도 그때 같이 받았어요. 부동산 사장님이 세트로 하는 거라고..." |
| `has_certified_mail` | false | "내용증명? 그건 안 보냈어요. 어떻게 하는지 잘 몰라서요. 학원장 언니가 그거는 변호사 통해서 하는 거라고 하던데..." |
| `registry_check` | true | "지난주에 등기부등본 한 번 떼봤어요. 소유자는 그대로였고..." |

---

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 12개 슬롯 일괄 수집

### Turn 1 — 전입신고와 확정일자

> **AI**: 계약 당시 전입신고와 확정일자는 받으셨나요?
>
> **의뢰인**: 아 네, 그게 이사 갈 때 부동산 사장님이 세트로 하는 거라고 해서 이사 직후에 같이 받았어요. 신경 안 쓰면 놓치는 거라고 그러시더라고요.

수집: `has_resident_reg` = true, `has_fixed_date` = true

### Turn 2 — 내용증명

> **AI**: 내용증명은 발송하신 적 있으신가요?
>
> **의뢰인**: 내용증명은 안 보냈어요. 어떻게 하는지 잘 몰라서요. 학원장 언니가 그거는 변호사 통해서 하는 거라고 하던데 저는 그 정도까지 가야 하나 싶기도 하고...

수집: `has_certified_mail` = false

### Turn 3 — 등기부등본

> **AI**: 등기부등본은 확인해보신 적 있으신가요?
>
> **의뢰인**: 아 그건 지난주에 한 번 떼봤어요. 학원장 언니가 그것도 확인해두라고 해서요. 소유자는 그대로였고 특별한 건 없어 보였어요.

수집: `registry_check` = true

### Turn 4 — 수집 완료 확인

> **AI**: 말해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 남기실 내용이 있나요?
>
> **의뢰인**: *(엄격+범위좁힘: `open_question_response`)*
>
> "지금 생각나는 건 없어요"

### 대화 종료 조건

- 체크리스트 16개 항목 전부 수집 완료
- 추가 법률 쟁점 없음 (v1 순수)
- 총 5~7턴 예상 (low이지만 over_explaining 산만함 감안 여유분)

---

## 3. 변환/설계 메모

1. **`over_explaining × low` 정책 검증**: §2-3 low 구간(hidden 0–6)에 hidden 4로 안착. 009(hidden 2)·010(hidden 1)·011(hidden 1)과 대비 — low 안에서도 다양한 스펙트럼 확보. over_explaining 특성상 잡음이 슬롯 노출 밀도를 낮추므로 low 상단(hidden 4) 자연스러움.

2. **잡음 vs 신호 분리 측정 지점**: first_utterance에 "학원생들 부동산 상속 얘기", "학원장 언니 조언", "부동산 카페 정보" 같은 GT 무관 정보가 삽입됨. IA가 이를 필터링하고 실제 슬롯만 추출하는지 확인. 후속 답변(Turn 1~3)에서도 잡음이 지속 — "세트로 하는 거라고", "변호사 통해서 하는 거라고 하던데" 등 부수 정보 섞임.

3. **동일 페르소나 양 끝점 (008 vs 012)**: 008은 4문장·hidden 14로 정보 극소, 012는 10문장·hidden 4로 정보 극대. 같은 over_explaining 페르소나의 첫 발화 스펙트럼 확보. IA가 페르소나 자체를 인식하는지 vs difficulty만 인식하는지 구별 가능한 baseline 쌍.

4. **`has_lien_registration: false` + 인지 있음**: 011(인지 X)과 대비되는 조합. `moving_out_planned` 상태에서 인지는 있으나 아직 시행 안 함 — 실제 법률 상담 유형에서 흔한 패턴. baseline 비교 시 IA가 "인지 O 미신청"과 "인지 X 미신청"을 구별해서 리포트 반영하는지 관찰 지점.

5. **45세 여성 학원장 페르소나**: 004(42F 회계), 008(33F 프리랜서 디자이너)에 이어 40대 여성 셋째 진입. 자영업 (학원장)은 신규 직업군.

6. **`expected_ia_turns 7`**: low 페르소나별 턴 수 스펙트럼 — 010(3), 011(3), 009(5), 012(7). over_explaining이 low 안에서도 산만함 때문에 턴 수 상단. baseline 비교 데이터.
