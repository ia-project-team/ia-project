---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-01 (new v1 case — fragmented × medium)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-014
case_title: "이메일 통보 후 이사 결정 미확정 - 개발자 단답형"
schema_version: "0.1"
created_at: "2026-07-01"
last_updated: "2026-07-01"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: fragmented
difficulty: medium                    # hidden 7-10 (§2-3)
move_out_status: unknown              # 첫 진입 — 이사 결정 미확정
notice_method: [email]                # 어휘집 신규 사용
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
# fragmented가 자발 안 하는 슬롯 + move_out 미확정 상태
risk_missing_points:
  - move_out_status
  - kakao_records
  - sms_records
  - certified_mail
  - leasehold_registration

# --- 4. 카운트 ---
hidden_info_count: 9    # first_utterance 7개 드러남 → hidden 9 → medium (7-10) 중앙
expected_ia_turns: 10

# --- 5. 페르소나 ---
persona:
  name: "정찬호"
  age: 32
  occupation: "스타트업 개발자 (백엔드)"
  residence_history: "인천 남동구 오피스텔 전세 2년 거주"
  current_situation: "2년 계약 종료 후 보증금 1.3억 전액 미반환. 이메일로 통보 두 번 발송해 회신은 받았으나 실제 반환 없음. 이사할지 계속 살지 결정 미확정 상태"

# --- 6. 첫 발화 ---
first_utterance: |
  보증금 못 받았어요. 인천 남동구 오피스텔이었어요.
  2023년 8월 1일부터 2025년 7월 31일까지 2년이었어요. 1억 3천이요.
  이메일로 통보 두 번 했어요. 답 왔는데 아직 안 돌려줘요.
  이사는 아직 결정 못 했어요.

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
    value: 130000000
    unit: KRW
    detail: "1억 3천만원"
  unreturned_amount:
    value: 130000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2023-08-03 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-08-01 확정일자 부여 (계약일 당일)"
  has_moved_out:
    value: false
    detail: "⭐ 물리적으로는 아직 거주 중이나 이사 결정 미확정. move_out_status: unknown"
  notice_date:
    value: "2025-06-10"
    detail: "첫 이메일 통보. 이후 2025-06-30 두 번째 이메일 발송"
  notice_method:
    value: [email]
    detail: "⭐ 어휘집 email 첫 사용. 이메일 단독 채널"
  landlord_responded:
    value: true
    detail: "이메일 회신 두 번. '확인 중', '조만간 정리하겠다' 정도. 반환 없음"
  has_kakao_records:
    value: false
    detail: "카톡 사용 안 함"
  has_certified_mail:
    value: false
    detail: "내용증명 발송 안 함"
  has_transfer_records:
    value: true
    detail: "보증금 입금 이체 내역 은행 앱에서 확인 가능"
  has_lien_registration:
    value: false
    detail: "이사 결정 안 해서 미신청"
  registry_check:
    value: true
    detail: "지난달 등기부등본 확인. 소유자 변경 없음"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: high          # fragmented — 캐물으면 정확 (§2-2)
    amount_precision: high
    emotion_level: low
    uncertainty_phrases:
      - "네."
      - "아니요."
      - "몰라요."
      - "그건 안 했어요."
      - "결정 안 했어요."
  proactive_speech_pool:
    # fragmented 톤 — 감정·정황 최소, GT 슬롯 정보 노출 없음
    - "네."
    - "필요한 건 정리해뒀어요."
    - "그건 안 물어보셔서요."
    - "말한 대로예요."
  open_question_response: "없어요."
---

# 시나리오 — 이메일 통보 후 이사 결정 미확정

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 정찬호 (32세)
- **직업**: 스타트업 개발자 (백엔드)
- **거주 이력**: 인천 남동구 오피스텔 전세 2년 거주
- **현재 상황**: 이메일로 두 번 통보 + 회신 있으나 반환 없음. 이사 결정 미확정 상태

### 이 케이스의 특징 (다른 케이스와의 차별점)

- **`fragmented × medium` 첫 진입**: 007(fragmented × high, 극단 단문)·010(fragmented × low, 절차 완벽 이행)과 중간 위치. 정보량 medium 밸런스
- **`move_out_status: unknown` 첫 진입**: 부차 분포 목표 4건 중 1건 확보. `has_moved_out: false`(물리 상태) + `status: unknown`(의도 미확정) 이중성 첫 표본
- **`notice_method: [email]` 어휘집 신규 사용**: 선례 6종 채널(kakao/sms/phone/certified_mail 4종만 사용). email 첫 진입 — 개발자 페르소나에 자연스러움
- **인천 남동구**: 지역 신규 진입
- **모든 답변이 극도로 짧음**: fragmented 본질 강한 발현. IA가 슬롯별 명시 질문 필수
- **`landlord_responded: true`이지만 이메일 회신뿐**: 실제 진전 없음. 006/008과 다른 채널 답변 형태

### first_utterance에서 드러나는 정보 (7개)

| 슬롯 | 드러남 근거 |
|---|---|
| `contract_start_date` | "2023년 8월 1일부터" |
| `contract_end_date` | "2025년 7월 31일까지" |
| `deposit_amount` | "1억 3천" |
| `unreturned_amount` | "안 돌려줘요" → 전액 (deposit과 동일) |
| `notice_method` | "이메일로" → [email] |
| `landlord_responded` | "답 왔는데" → true |
| `has_moved_out` | "이사는 아직 결정 못 했어요" → false (물리적으로 안 나감) + unknown 힌트 |

→ 7개 드러남, hidden = 16 − 7 = **9** → `medium` (7-10) 중앙 ✓

### 질문받아야 드러나는 정보 (숨겨진 9개)

| 슬롯 | GT value | 페르소나 발현 |
|---|---|---|
| `has_contract_doc` | true | "네." |
| `has_resident_reg` | true | "네. 이사하고 이틀 뒤에요." |
| `has_fixed_date` | true | "네. 계약일에요." |
| `notice_date` | 2025-06-10 | "6월 10일이요. 두 번째는 6월 30일." |
| `has_kakao_records` | false | "카톡 안 썼어요. 이메일로만요." |
| `has_certified_mail` | false | "안 보냈어요." |
| `has_transfer_records` | true | "은행 앱에 있어요." |
| `has_lien_registration` | false | "이사할지도 결정 안 해서요. 신청 안 했어요." |
| `registry_check` | true | "지난달에 확인했어요. 소유자 그대로예요." |

---

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 7개 슬롯

### Turn 1 — 계약서·전입신고·확정일자

> **AI**: 계약서 원본과 전입신고·확정일자 여부를 알려주실 수 있을까요?
>
> **의뢰인**: 원본 있어요. 전입신고는 이사 이틀 뒤에 했고 확정일자는 계약일에 받았어요.

수집: `has_contract_doc` = true, `has_resident_reg` = true, `has_fixed_date` = true

### Turn 2 — 통보 시점

> **AI**: 이메일 발송일이 언제였을까요?
>
> **의뢰인**: 6월 10일이요. 두 번째는 6월 30일.

수집: `notice_date` = 2025-06-10

### Turn 3 — 카톡·문자 기록

> **AI**: 이메일 외에 카톡이나 문자로 얘기하신 적 있나요?
>
> **의뢰인**: 아니요. 이메일로만 했어요.

수집: `has_kakao_records` = false

### Turn 4 — 내용증명

> **AI**: 내용증명은 발송하신 적 있으신가요?
>
> **의뢰인**: 안 보냈어요.

수집: `has_certified_mail` = false

### Turn 5 — 계좌이체 내역

> **AI**: 처음 보증금 입금 이체 내역은 남아 있나요?
>
> **의뢰인**: 은행 앱에 있어요.

수집: `has_transfer_records` = true

### Turn 6 — 임차권등기명령

> **AI**: 임차권등기명령은 신청하신 적 있나요?
>
> **의뢰인**: 이사할지도 결정 안 해서요. 안 했어요.

수집: `has_lien_registration` = false

### Turn 7 — 등기부등본

> **AI**: 등기부등본은 확인해보셨나요?
>
> **의뢰인**: 지난달에 확인했어요. 소유자 그대로예요.

수집: `registry_check` = true

### Turn 8 — 이사 계획 명확화 (unknown 처리)

> **AI**: 이사 결정을 아직 안 하신 이유가 있으실까요? 계약 갱신 요구를 하실 예정인가요, 아니면 반환받고 나갈 계획인가요?
>
> **의뢰인**: 회사가 이직할 수도 있어서 결정 못 하겠어요.

수집(메타): `move_out_status` = unknown 확정

*(비고: `has_moved_out` boolean은 false로 명확하나 status enum은 unknown 유지. IA가 이 이중성을 어떻게 리포트에 반영하는지가 baseline 비교 지점)*

### Turn 9 — 수집 완료 확인

> **AI**: 말해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 남기실 내용이 있나요?
>
> **의뢰인**: *(엄격+범위좁힘: `open_question_response`)*
>
> "없어요."

### 대화 종료 조건

- 체크리스트 16개 항목 전부 수집 완료
- 추가 법률 쟁점 없음 (v1 순수)
- 총 9~10턴 예상 (medium — fragmented가 슬롯별 명시 질문 필요)

---

## 3. 변환/설계 메모

1. **`fragmented × medium` 정책 검증**: §2-3 medium 구간(hidden 7–10)에 hidden 9로 안착. 007(high, 2문장 극단)·010(low, 15개 나열)의 중간 밸런스. fragmented 페르소나가 medium에서는 "핵심 슬롯 4-5개만 자발 노출 + 나머지는 IA 명시 질문 필요" 패턴으로 발현.

2. **`move_out_status: unknown` 첫 표본 — 이중성 처리**: `has_moved_out` boolean(false, 아직 안 나감) vs status enum(unknown, 결정 미확정)의 분리. baseline 비교 시 IA가 (a) boolean만 수집하고 status 놓치는지, (b) status를 living_in_property로 잘못 매핑하는지, (c) unknown으로 정확히 잡는지 3분기 관찰 지점. Turn 8이 이 이중성 명확화 턴.

3. **`notice_method: [email]` 어휘집 신규 사용**: 어휘집 7종 중 지금까지 4종(kakao/sms/phone/certified_mail)만 사용. email 첫 진입으로 어휘집 커버리지 확대. 32세 개발자 페르소나에 자연스러움 — 카톡보다 이메일이 기록 관점에서 명시적.

4. **fragmented 톤 유지 시나리오**: 모든 답변이 1-2문장, 대부분 단답. Turn 2 "6월 10일이요. 두 번째는 6월 30일" 정도가 최대 부연. `uncertainty_phrases`에 "결정 안 했어요" 신규 추가 — unknown status 발현용.

5. **개발자 페르소나 신규**: 007(35M IT회사원)에 이어 IT 계열 두 번째이나 세부 직군(백엔드 개발자·스타트업) 차별. 32세라 007(35세)과 세대 유사.

6. **`expected_ia_turns 10`**: medium fragmented 페르소나의 최소 턴 — 슬롯별 명시 질문이 필수라 hidden 9면 최소 9턴 필요. 013(11, emotional)·004(10, avoidant)와 유사. Turn 8 명확화(unknown status)가 fragmented 특유 여유분.
