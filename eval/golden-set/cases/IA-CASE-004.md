---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-06-30 (new v1 case — avoidant × medium)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-004
case_title: "장기 거주 부분 반환 후 잔금 미반환 - 회사원"
schema_version: "0.1"
created_at: "2026-06-30"
last_updated: "2026-06-30"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: avoidant
difficulty: medium                    # hidden 7-10 (§2-3 매핑)
move_out_status: moved_out
notice_method: [certified_mail]
evidence_items:
  - contract_doc
  - certified_mail
  - transfer_records
  - registry_doc
evaluation_purpose:
  - golden_set
  - checklist_recall
  - single_turn_comparison

# --- 3. 평가 분류 ---
# v1 순수 케이스
issue_tags: []
# avoidant 페르소나가 늦게 꺼내는 정보 + v1 단일턴 누락 위험
risk_missing_points:
  - unreturned_amount
  - contract_start_date
  - notice_date
  - notice_method_validity
  - landlord_response

# --- 4. 카운트 ---
hidden_info_count: 9    # first_utterance 7개 드러남 → hidden 9 → medium (7-10) 중앙
expected_ia_turns: 10

# --- 5. 페르소나 ---
persona:
  name: "박은영"
  age: 42
  occupation: "회계사무소 사무원"
  residence_history: "서울 마포구 아파트 전세 2년 + 명시적 갱신 2년 총 4년 거주"
  current_situation: "4년 장기 거주 후 보증금 1억 8천 중 5천만원만 부분 반환받고 1억 3천 잔금 미반환 상태로 퇴거 완료. 본인은 부분 반환받은 사실을 약점처럼 느껴 처음엔 안 꺼냄"

# --- 6. 첫 발화 ---
first_utterance: |
  4년 동안 살던 집에서 8월에 이사 나왔는데 보증금 1억 8천 중에
  아직 못 받은 게 있어요. 계약 끝나기 두 달쯤 전에 내용증명도 보냈고,
  이사 나오기 전에 임차권등기명령도 신청해서 등기까지 받았어요.
  집주인은 처음엔 답을 했는데 그 뒤로는 연락이 잘 안 되네요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유. 갱신계약서까지 함께 보관"
  contract_start_date:
    value: "2021-09-01"
    detail: "최초 계약일. 2년 + 명시적 갱신 2년"
  contract_end_date:
    value: "2025-08-31"
    detail: "갱신 계약 만료일"
  deposit_amount:
    value: 180000000
    unit: KRW
    detail: "1억 8천만원. 갱신 시 동결 (증액 없음)"
  unreturned_amount:
    value: 130000000
    unit: KRW
    detail: "⭐ avoidant 본질 발현 슬롯. 5천만원 부분 반환받고 1억 3천 미반환. 의뢰인은 부분 반환 받은 사실을 처음 발화에서 안 꺼냄"
  has_resident_reg:
    value: true
    detail: "2021-09-02 전입신고. 4년간 유지"
  has_fixed_date:
    value: true
    detail: "2021-09-01 확정일자 받음"
  has_moved_out:
    value: true
    detail: "2025-09-15 신규 아파트로 이사 완료. 임차권등기 후 퇴거"
  notice_date:
    value: "2025-07-10"
    detail: "계약 종료 약 두 달 전 내용증명 발송. 카톡·문자 사전 통보 없음"
  notice_method:
    value: [certified_mail]
    detail: "내용증명 단독. 카톡·문자·전화 사전 통보 없이 바로 내용증명으로 시작"
  landlord_responded:
    value: true
    detail: "내용증명 받고 전화로 한 번 답변. '5천만원 먼저 줄 테니 나머지는 기다려달라'고 함. 5천 받은 이후 연락 두절"
  has_kakao_records:
    value: false
    detail: "집주인과 카톡 사용한 적 없음. 모든 의사소통이 전화 또는 내용증명"
  has_certified_mail:
    value: true
    detail: "2025-07-10 발송본 + 수령 통지 모두 보관"
  has_transfer_records:
    value: true
    detail: "최초 보증금 입금 이체 내역 + 5천만원 부분 반환받은 입금 내역 모두 은행 앱에서 확인 가능"
  has_lien_registration:
    value: true
    detail: "2025-09-10 임차권등기명령 신청, 9월 12일경 등기 완료 후 9월 15일 퇴거"
  registry_check:
    value: true
    detail: "임차권등기 신청 직전 등기부등본 확인. 소유자 변경 없음, 큰 선순위 근저당 없음 확인"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: high          # avoidant — 유리정보·자기처리한 절차는 정확
    amount_precision: high        # 보증금 액수도 정확 (단, 부분 반환 액수만 머뭇거림)
    emotion_level: low            # avoidant 톤 (§2-2)
    uncertainty_phrases:
      - "음... 글쎄요"
      - "사실..."
      - "그게 좀..."
      - "정확히는..."
  proactive_speech_pool:
    # avoidant 본질 보조 정황 — GT 슬롯 정보 직접 노출 없음
    - "회사 다니면서 알아보기가 쉽지 않네요"
    - "처음 겪는 일이라 막막해요"
    - "조용히 해결되면 좋을 텐데..."
    - "주변에 변호사 아는 분은 없어서요"
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 장기 거주 부분 반환 후 잔금 미반환

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 박은영 (42세)
- **직업**: 회계사무소 사무원
- **거주 이력**: 서울 마포구 아파트 전세 4년 (2년 + 명시적 갱신 2년)
- **현재 상황**: 4년 장기 거주 후 보증금 1억 8천 중 5천만원만 받고 1억 3천 미반환 상태로 퇴거 완료. 임차권등기까지 완료한 상태

### 이 케이스의 특징 (다른 케이스와의 차별점)

- **`avoidant × medium` 첫 진입**: 분포 그리드의 `avoidant` 행 medium 칸 첫 케이스. 001(`avoidant × low`)과 동일 페르소나의 medium 변형
- **부분 반환 분기 (avoidant 본질)**: deposit(1.8억) ≠ unreturned(1.3억). 5천만원은 받았으나 의뢰인이 처음엔 안 꺼냄. 007(`fragmented × high`, 부분 반환)과 달리 이번엔 avoidant 본질 핵심 발현 슬롯
- **`notice_method: [certified_mail]` 단독**: 카톡·문자·전화 사전 통보 없이 바로 내용증명으로 시작. 선례 5건과 통보 채널 차별
- **4년 장기 거주 + 명시적 갱신**: 선례 5건 모두 1~2년 단순 계약. 갱신 케이스 첫 진입
- **임차권등기 + 등기부 확인 둘 다 true**: 001(둘 다 false)과 정반대. 의뢰인이 절차에 능통하나 그 사실을 자랑하지 않음 (avoidant 본질)
- **`landlord_responded: true`이지만 약속 미이행**: 008(반복 약속)과 달리 한 번 답변 후 5천 부분 반환 후 연락 두절

### first_utterance에서 드러나는 정보 (7개)

| 슬롯 | 드러남 근거 |
|---|---|
| `contract_end_date` | "4년 동안 살던 집에서 8월에 이사" → 종료 8월말 추론 |
| `has_moved_out` | "이사 나왔는데" → true |
| `deposit_amount` | "1억 8천" |
| `has_certified_mail` | "내용증명도 보냈고" → true |
| `notice_method` | "내용증명" → [certified_mail] |
| `has_lien_registration` | "임차권등기명령도 신청해서 등기까지 받았어요" → true |
| `landlord_responded` | "처음엔 답을 했는데" → true |

→ 7개 드러남, hidden = 16 − 7 = **9** → `medium` (7–10) 중앙 ✓

> 참고: `unreturned_amount`는 "아직 못 받은 게 있어요"로 미반환 존재 boolean만 드러남. 구체 금액(1억 3천)은 미드러남으로 카운트 — avoidant 본질의 핵심.

### 질문받아야 드러나는 정보 (숨겨진 9개)

| 슬롯 | GT value | 페르소나 발현 |
|---|---|---|
| `has_contract_doc` | true | 평범 |
| `contract_start_date` | 2021-09-01 | 평범 ("2021년 9월부터요") |
| **`unreturned_amount`** | **130,000,000** | ⭐⭐ avoidant 핵심 — "사실 5천만원은 먼저 받았어요. 1억 3천이 남았어요" |
| `has_resident_reg` | true | 평범 |
| `has_fixed_date` | true | 평범 |
| `notice_date` | 2025-07-10 | 평범 |
| `has_kakao_records` | false | 평범 |
| `has_transfer_records` | true | 평범 |
| `registry_check` | true | 평범 ("임차권등기 신청 전에 봤어요") |

---

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: 4년 동안 살던 집에서 8월에 이사 나왔는데 보증금 1억 8천 중에 아직 못 받은 게 있어요. 계약 끝나기 두 달쯤 전에 내용증명도 보냈고, 이사 나오기 전에 임차권등기명령도 신청해서 등기까지 받았어요. 집주인은 처음엔 답을 했는데 그 뒤로는 연락이 잘 안 되네요.

수집(자동): `contract_end_date`(월), `has_moved_out`, `deposit_amount`, `has_certified_mail`, `notice_method`, `has_lien_registration`, `landlord_responded`

### Turn 1 — 계약서 확인

> **AI**: 임대차계약서는 갖고 계신가요? 갱신계약서도 함께 있을까요?
>
> **의뢰인**: 네, 둘 다 있어요.

수집: `has_contract_doc` = true

### Turn 2 — 계약 시작일과 종료일 정확화

> **AI**: 최초 계약 시작일과 갱신 후 종료일이 언제인지 알려주실 수 있을까요?
>
> **의뢰인**: 2021년 9월 1일부터 시작했고, 갱신해서 올해 8월 31일까지였어요.

수집: `contract_start_date` = 2021-09-01, `contract_end_date` = 2025-08-31

### Turn 3 — 보증금 총액과 미반환 금액 (avoidant 핵심 발현)

> **AI**: 보증금은 총 얼마이고, 지금 못 받으신 금액은 정확히 얼마인가요?
>
> **의뢰인**: 보증금은 1억 8천이었고요. 음... 사실 5천만원은 먼저 받았어요. 그래서 지금 1억 3천이 남아 있어요.

수집: `deposit_amount` = 180,000,000, `unreturned_amount` = 130,000,000

*(비고: ⭐⭐ avoidant 본질 핵심 발현. first_utterance에서 "아직 못 받은 게 있어요"라고만 했지만 IA가 정확값 물으면 머뭇거림과 함께 부분 반환 사실 인정. risk_missing_points의 `unreturned_amount` 발현 — 단일턴 baseline이 1.8억 전액 미반환으로 잘못 잡을 가능성이 큰 슬롯)*

### Turn 4 — 전입신고와 확정일자

> **AI**: 계약 당시 전입신고와 확정일자는 받으셨나요?
>
> **의뢰인**: 네, 이사 다음 날 전입신고 했고 확정일자는 계약일에 받았어요.

수집: `has_resident_reg` = true, `has_fixed_date` = true

### Turn 5 — 통보 시점 정확화

> **AI**: 내용증명은 정확히 언제 발송하셨나요?
>
> **의뢰인**: 7월 10일에 보냈어요. 발송 영수증이랑 수령 통지도 보관하고 있어요.

수집: `notice_date` = 2025-07-10

### Turn 6 — 통보 답변 세부와 카톡 기록

> **AI**: 집주인이 내용증명 받고 어떻게 답변했나요? 카톡이나 문자로 추가 연락한 적은 있나요?
>
> **의뢰인**: 전화로 한 번 답이 왔어요. 5천만원은 먼저 줄 테니 나머지는 기다려달라고요. 카톡은 따로 안 했어요. 4년 내내 전화로만 연락했어요.

수집: `has_kakao_records` = false (그리고 `landlord_responded` 세부 검증)

### Turn 7 — 계좌이체 내역

> **AI**: 최초 보증금 입금 내역과 5천만원 받으신 입금 내역도 남아 있나요?
>
> **의뢰인**: 네, 둘 다 은행 앱에 있어요.

수집: `has_transfer_records` = true

### Turn 8 — 등기부등본 확인

> **AI**: 임차권등기명령 신청 전에 등기부등본을 확인하셨을 텐데, 그때 소유자 변경이나 근저당권 같은 게 있었나요?
>
> **의뢰인**: 네, 봤어요. 소유자 변경은 없었고 큰 근저당도 안 잡혀 있더라고요.

수집: `registry_check` = true

### Turn 9 — 수집 완료 확인

> **AI**: 말해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 남기실 내용이 있나요?
>
> **의뢰인**: *(엄격+범위좁힘 규칙: `open_question_response`)*
>
> "지금 생각나는 건 없어요"

### 대화 종료 조건

- 체크리스트 16개 항목 전부 수집 완료
- 추가 법률 쟁점 없음 (v1 순수)
- 총 9~10턴 예상 (medium 난이도, avoidant — 부분 반환 발현 후 빠르게 진행)

---

## 3. 변환/설계 메모

1. **`avoidant × medium` 정책 검증**: §2-3 medium 구간(hidden 7–10)에 정확히 9로 안착. first_utterance에 7개 슬롯이 노출되되 보증금 액수 외에는 구체값 거의 없음. 페르소나 본질은 Turn 3의 부분 반환 사실 인정 시점에 집중 발현 (`uncertainty_phrases: "사실..."`).

2. **`unreturned_amount`의 avoidant 발현**: boolean이 아닌 금액 슬롯이 avoidant 본질로 발현되는 첫 케이스. 001은 boolean false 슬롯(`has_resident_reg`, `has_fixed_date`)에서 발현. 측정 측면: 단일턴 baseline은 "1.8억 못 받았다"는 첫 발화에서 1.8억 전액 미반환으로 잘못 잡을 가능성이 매우 높다. IA가 정확값을 물어 1.3억으로 정정하는 능력이 핵심 변별 포인트.

3. **`notice_method: [certified_mail]` 단독의 의미**: 카톡·문자 사전 통보 없이 바로 내용증명으로 시작 = 의뢰인이 절차에 능숙. 그러나 본인은 "조용히 해결되면..."이라며 절차 능숙함을 드러내지 않음 (avoidant 본질). `risk_missing_points: notice_method_validity`는 사전 통보 부재에 대한 검토 항목.

4. **명시적 갱신 케이스 첫 진입**: 003의 자동연장 혼동과 분리. 004는 갱신 합의가 명확하므로 묵시적 갱신(`implied_renewal`) v2 쟁점 아님. v1 유지. 다만 24케이스 작성 시 갱신 케이스 비중 모니터링 필요.

5. **`has_lien_registration: true` + `registry_check: true` 조합**: 001/002/003(전부 false)과 정반대. 007(둘 다 true) 다음 두 번째 케이스. avoidant 페르소나가 절차를 챙긴 사례라는 점에서 fragmented(007)와 본질 차이가 있음 — fragmented는 사실 위주 단답, avoidant는 사실은 했으나 자랑하지 않음.

6. **`expected_ia_turns 10`**: medium이지만 avoidant 본질이 Turn 3 한 곳에 집중되어 명확화 턴이 길지 않음. 003(confused, 12턴)보다 적음. 페르소나별 턴 수 차이 데이터.
