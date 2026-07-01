---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-06-30 (new v1 case — avoidant × low, low 정책 검증용)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-001
case_title: "전입신고 미이행 - 사회초년생 보증금 미반환"
schema_version: "0.1"
created_at: "2026-06-30"
last_updated: "2026-06-30"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: avoidant
difficulty: low                       # hidden_info_count 0–6 (§2-3 매핑)
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
# v1 순수 케이스 (RAG 추가쟁점 없음)
issue_tags: []
# avoidant 페르소나가 늦게 꺼내는 정보 + v1 단일턴 누락 위험
risk_missing_points:
  - resident_registration
  - fixed_date
  - certified_mail
  - leasehold_registration
  - registry_not_checked

# --- 4. 카운트 ---
hidden_info_count: 6     # first_utterance에 10개 드러남 → hidden 6 → low (0-6)
expected_ia_turns: 8     # low 난이도라 적음

# --- 5. 페르소나 ---
persona:
  name: "박지훈"
  age: 27
  occupation: "사회초년생 IT 회사원"
  residence_history: "부산 사하구 원룸 전세 1년 거주"
  current_situation: "1년 전세 종료 후 새 집으로 이사. 보증금 5천만원 전액 미반환. 사회초년생이라 첫 계약 시 전입신고·확정일자 절차를 챙기지 못함"

# --- 6. 첫 발화 ---
first_utterance: |
  보증금 5천만원을 못 받고 있어요. 작년 3월부터 1년 계약이었고
  올해 2월 말에 끝났어요. 이사는 새 집으로 다 갔고요.
  계약 종료 한 달 반 전인 1월 중순쯤 카톡으로 보증금 돌려달라고 했고
  "조금만 기다려달라"고 답변은 받았어요. 그 카톡은 캡처해뒀고요.
  근데 그 뒤로 연락이 잘 안 돼서요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2024-03-01"
  contract_end_date:
    value: "2025-02-28"
  deposit_amount:
    value: 50000000
    unit: KRW
  unreturned_amount:
    value: 50000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: false
    detail: "사회초년생이라 절차를 몰랐고 신고 안 함 (avoidant 본질 — 본인 실수라 늦게 인정)"
  has_fixed_date:
    value: false
    detail: "확정일자도 마찬가지로 안 받음 (avoidant 본질)"
  has_moved_out:
    value: true
    detail: "2025-03-15 새 집으로 이사 완료"
  notice_date:
    value: "2025-01-15"
  notice_method:
    value: [kakao]
  landlord_responded:
    value: true
    detail: "조금만 기다려달라 카톡 답변, 이후 연락 두절"
  has_kakao_records:
    value: true
    detail: "전체 캡처 보관"
  has_certified_mail:
    value: false
    detail: "절차를 몰라 안 보냄"
  has_transfer_records:
    value: true
    detail: "보증금 입금 이체 내역 보유"
  has_lien_registration:
    value: false
    detail: "이미 이사해버려서 신청 못 함 (절차 인지 부족)"
  registry_check:
    value: false
    detail: "확인 안 함"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: high          # avoidant — 유리정보는 정확
    amount_precision: high
    emotion_level: low            # avoidant 톤 (§2-2 매핑)
    uncertainty_phrases:
      - "음... 글쎄요"
      - "그건 좀..."
      - "아... 그건..."
  proactive_speech_pool:
    # avoidant 본질을 보조하는 복선 — GT 16슬롯 정보 직접 노출 없음
    - "처음 계약할 때 잘 몰랐어요"
    - "사회 초년생이라 부동산 일이 처음이에요"
    - "주변에서 이러면 안 된다고 해서 알아보고 있어요"
    - "그때는 그냥 들어가서 살았어요"
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 사회초년생 전입신고 미이행

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 박지훈 (27세)
- **직업**: 사회초년생 IT 회사원
- **거주 이력**: 부산 사하구 원룸 전세 1년 거주
- **현재 상황**: 1년 전세 종료 후 새 집으로 이사 완료. 보증금 5천만원 전액 미반환. 첫 계약이라 전입신고·확정일자 절차를 챙기지 못함

### 이 케이스의 특징 (다른 케이스와의 차별점)

- **`avoidant × low` 조합**: 분포 그리드의 `low` 칸 첫 진입 케이스. §2-3 `low` 정책(2026-06-30 재정립)의 첫 검증 케이스
- **first_utterance에 정보 풍부 노출**: 5천만원, 작년 3월~올해 2월, 이사 완료, 1월 중순 카톡 통보, 답변 받음, 캡처 보관 — 10개 슬롯이 첫 발화로 드러남
- **avoidant 본질은 숨겨진 6개 중 불리정보 2개에서 발현**: `has_resident_reg: false` + `has_fixed_date: false`. 본인 실수로 인한 불리정보라 IA가 묻기 전엔 안 꺼냄. 시뮬레이션 중 머뭇거리는 답변("음... 그건 안 했어요")으로 발현
- **사회초년생 설정**: 페르소나 자연스러움 보강. `proactive_speech_pool`의 "처음 계약할 때 잘 몰랐어요"가 전입신고/확정일자 미이행의 복선 역할

### first_utterance에서 드러나는 정보 (10개)

| 슬롯 | 드러남 근거 |
|---|---|
| `deposit_amount` | "5천만원" |
| `unreturned_amount` | "못 받고 있어요" + 5천만원 = 전액 미반환 |
| `contract_start_date` | "작년 3월부터" |
| `contract_end_date` | "올해 2월 말에 끝났어요" |
| `has_contract_doc` | "1년 계약" 언급 = 계약서 존재 암시 |
| `has_moved_out` | "이사는 새 집으로 다 갔고요" |
| `notice_date` | "1월 중순쯤" |
| `notice_method` | "카톡으로" |
| `landlord_responded` | "답변은 받았어요" |
| `has_kakao_records` | "캡처해뒀고요" |

→ 10개 드러남, hidden = 16 - 10 = **6** → `low` (0–6) ✓

### 질문받아야 드러나는 정보 (숨겨진 6개)

| 슬롯 | GT value | 페르소나 발현 |
|---|---|---|
| `has_resident_reg` | **false** | ⭐ avoidant — 머뭇거림 후 인정 |
| `has_fixed_date` | **false** | ⭐ avoidant — 동반 인정 |
| `has_transfer_records` | true | 평범하게 답변 |
| `has_certified_mail` | false | "절차를 몰라서..." |
| `has_lien_registration` | false | "이미 이사해버려서..." |
| `registry_check` | false | "그건 안 봤어요" |

---

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: 보증금 5천만원을 못 받고 있어요. 작년 3월부터 1년 계약이었고 올해 2월 말에 끝났어요. 이사는 새 집으로 다 갔고요. 계약 종료 한 달 반 전인 1월 중순쯤 카톡으로 보증금 돌려달라고 했고 "조금만 기다려달라"고 답변은 받았어요. 그 카톡은 캡처해뒀고요. 근데 그 뒤로 연락이 잘 안 돼서요.

수집(자동): `deposit_amount`, `unreturned_amount`, `contract_start_date`, `contract_end_date`, `has_contract_doc`, `has_moved_out`, `notice_date`, `notice_method`, `landlord_responded`, `has_kakao_records`

### Turn 1 — 전입신고 (avoidant 핵심 1)

> **AI**: 계약 당시 전입신고는 하셨나요?
>
> **의뢰인**: 음... 그건 안 했어요. 처음 계약할 때 그게 뭔지 잘 몰라서요.

수집: `has_resident_reg` = false

### Turn 2 — 확정일자 (avoidant 핵심 2)

> **AI**: 확정일자는 받으셨을까요?
>
> **의뢰인**: 그것도 안 받았어요. 그때는 그런 절차가 있는 줄도 몰라서...

수집: `has_fixed_date` = false

### Turn 3 — 계좌이체 기록

> **AI**: 처음 보증금을 입금하셨을 때 계좌이체 내역은 남아있나요?
>
> **의뢰인**: 네, 그건 있어요.

수집: `has_transfer_records` = true

### Turn 4 — 내용증명

> **AI**: 카톡 외에 내용증명을 보내신 적은 있나요?
>
> **의뢰인**: 아니요, 그건 어떻게 보내는지 몰라서 안 했어요.

수집: `has_certified_mail` = false

### Turn 5 — 임차권등기명령

> **AI**: 이사 나오시기 전에 임차권등기명령을 신청하신 적이 있나요?
>
> **의뢰인**: 아니요. 그런 게 있는 줄도 몰라서요. 그냥 이사부터 갔어요.

수집: `has_lien_registration` = false

### Turn 6 — 등기부등본

> **AI**: 최근 등기부등본을 확인해서 집주인 변경이나 근저당권 같은 권리관계를 보신 적이 있나요?
>
> **의뢰인**: 아니요, 그건 안 봤어요.

수집: `registry_check` = false

### Turn 7 — 수집 완료 확인

> **AI**: 말씀해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 남기실 내용이 있나요?
>
> **의뢰인**: *(엄격+범위좁힘 규칙: `open_question_response`)*
>
> "지금 생각나는 건 없어요"

### 대화 종료 조건

- 체크리스트 16개 항목 전부 수집 완료
- 추가 법률 쟁점 없음 (v1 순수)
- 총 7~8턴 예상 (low 난이도 — 빠른 종료)

---

## 3. 변환/설계 메모

1. **`low` 정책 첫 검증 케이스**: §2-3에 박은 "first_utterance 자연스러움 제약 해제, 구체값 충분 노출" 정책이 실전에서 작동하는지 검증. 5문장으로 늘어났지만 사회초년생 설정 덕에 부자연스럽지는 않음 — 첫 발화 길이의 자연스러움 한계 탐색.

2. **avoidant 본질 발현 포인트**: `has_resident_reg`/`has_fixed_date` 두 슬롯에서 머뭇거림(`"음... 그건 안 했어요"`). 시뮬레이터 `answer_style.uncertainty_phrases`가 이 시점에 발현되도록 설계.

3. **사회초년생 페르소나의 다층 기능**:
   - `current_situation`에 "절차 인지 부족" 명시 → 시뮬레이터가 일관된 캐릭터 유지
   - `proactive_speech_pool`의 "처음 계약할 때 잘 몰랐어요"는 GT 슬롯 정보를 노출하지 않으면서 avoidant 복선
   - 후반 슬롯들(`has_certified_mail`, `has_lien_registration`)의 "절차 몰라서" 답변과 결을 일치

4. **expected_ia_turns 8로 축소**: 첫 발화 10슬롯 + Turn 1–6 단답 → 7~8턴 종료 예상. high 케이스(13턴)와 대비.

5. **IA 평가 관점에서의 의미**: low 케이스는 baseline 우위가 약화될 가능성이 큼 (첫 발화에 정보가 다 있어서). 진짜 변별력이 드러나는 건 **avoidant 본질이 발현되는 Turn 1–2**에서 IA가 머뭇거림을 confirmed로 정확히 잡아내는지. baseline(체크리스트 없음)은 이 시점에 "잘 몰랐다" 발화를 unknown으로 흘릴 가능성 — 이게 측정 포인트.
