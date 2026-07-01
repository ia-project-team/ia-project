---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-01 (new v1 case — fragmented × low)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-010
case_title: "무응답 집주인 대응 완료한 공무원 - 절차형 단답"
schema_version: "0.1"
created_at: "2026-07-01"
last_updated: "2026-07-01"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: fragmented
difficulty: low                       # hidden 0-6 (§2-3)
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
issue_tags: []
# fragmented가 자발 말 안 하는 slot + 카톡 미사용 정황
risk_missing_points:
  - kakao_records
  - landlord_no_response

# --- 4. 카운트 ---
hidden_info_count: 1    # first_utterance 15개 드러남 → hidden 1 → low (0-6) 최소
expected_ia_turns: 3

# --- 5. 페르소나 ---
persona:
  name: "신영훈"
  age: 45
  occupation: "지방직 공무원 (도청 근무)"
  residence_history: "서울 강동구 오피스텔 전세 2년 거주 후 퇴거"
  current_situation: "2년 계약 종료 후 보증금 1.8억 전액 미반환. 계약 종료 두 달 전 내용증명 발송했으나 집주인 완전 무응답. 퇴거 직전 임차권등기 신청 후 이사 완료. 필요한 절차는 모두 이행한 상태"

# --- 6. 첫 발화 ---
first_utterance: |
  보증금 못 받았어요. 서울 강동구 오피스텔이었고요.
  계약은 2023년 11월 1일부터 2025년 10월 31일까지 2년이었어요.
  1억 8천 전액이요. 9월 1일에 내용증명 보냈고 답 없었어요.
  11월 15일에 이사 나왔고 그 전 10일에 임차권등기 신청해서 등기했어요.
  계약서 원본 있고 등기부도 확인했어요. 전입신고랑 확정일자는 계약 당일에 받았어요.
  이체내역도 있어요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2023-11-01"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2025-10-31"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 180000000
    unit: KRW
    detail: "1억 8천만원"
  unreturned_amount:
    value: 180000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2023-11-02 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-11-01 확정일자 부여 (계약일 당일)"
  has_moved_out:
    value: true
    detail: "2025-11-15 이사 완료"
  notice_date:
    value: "2025-09-01"
    detail: "계약 종료 두 달 전 내용증명 발송"
  notice_method:
    value: [certified_mail]
    detail: "내용증명 단독. 카톡·문자·전화 일절 사용 안 함"
  landlord_responded:
    value: false
    detail: "⭐ 내용증명 수령 확인은 됐으나 일절 답변 없음. landlord_no_response 두 번째 진입 (006 이후)"
  has_kakao_records:
    value: false
    detail: "집주인과 카톡 자체를 사용한 적 없음"
  has_certified_mail:
    value: true
    detail: "2025-09-01 발송본 + 수령 통지 보관"
  has_transfer_records:
    value: true
    detail: "보증금 입금 이체 내역 은행 앱에서 확인 가능"
  has_lien_registration:
    value: true
    detail: "2025-11-10 임차권등기명령 신청, 11월 13일경 등기 완료 후 11월 15일 퇴거"
  registry_check:
    value: true
    detail: "임차권등기 신청 전 등기부등본 확인. 소유자 변경 없음, 근저당 없음"

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
      - "기억 안 나요."
  proactive_speech_pool:
    # fragmented 톤 — 감정·정황 최소, GT 슬롯 정보 노출 없음
    - "특별히 더 드릴 말씀은 없어요."
    - "필요한 서류는 정리해뒀어요."
    - "말한 대로예요."
    - "네."
  open_question_response: "없어요."
---

# 시나리오 — 무응답 집주인 대응 완료한 공무원

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 신영훈 (45세)
- **직업**: 지방직 공무원 (도청 근무)
- **거주 이력**: 서울 강동구 오피스텔 전세 2년 거주 후 퇴거
- **현재 상황**: 절차를 모두 이행했으나 집주인 무응답으로 보증금 1.8억 전액 미반환 상태

### 이 케이스의 특징 (다른 케이스와의 차별점)

- **`fragmented × low` 첫 진입**: 007(fragmented × high, 첫 발화 2문장)과 정보량 극대·극소 대비. 같은 페르소나의 양 끝점
- **`landlord_responded: false` + 모든 절차 이행**: 006(무응답 + 3교대 시간 부족)과 정반대 — 006은 절차 미이행 다수, 010은 완벽 이행. 무응답 케이스 내 대응력 차별
- **`notice_method: [certified_mail]` 단독**: 004(avoidant × medium)와 같은 채널이지만 페르소나·발현 완전 다름 — 004는 절차 능숙함을 안 드러냄, 010은 사실을 그대로 나열
- **모든 권리보전·증거 슬롯 true (kakao 제외)**: has_certified_mail·has_transfer_records·has_lien_registration·registry_check 전부 true. 007과 유사 구조이나 fragmented 발현 양상 다름
- **서울 강동구 오피스텔**: 지역 신규 (선례 성북·강서·마포·서대문·동작·부산·인천·광주)
- **low 정책 발현**: first_utterance에 슬롯 15개 노출. 남은 hidden 1개(`has_kakao_records`)는 IA가 물어야 나옴

### first_utterance에서 드러나는 정보 (15개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_contract_doc` | "계약서 원본 있고" |
| `contract_start_date` | "2023년 11월 1일부터" |
| `contract_end_date` | "2025년 10월 31일까지" |
| `deposit_amount` | "1억 8천" |
| `unreturned_amount` | "1억 8천 전액이요" → 전액 |
| `has_resident_reg` | "전입신고... 받았어요" |
| `has_fixed_date` | "확정일자는 계약 당일에 받았어요" |
| `has_moved_out` | "11월 15일에 이사 나왔고" → true |
| `notice_date` | "9월 1일에 내용증명 보냈고" |
| `notice_method` | "내용증명" → [certified_mail] |
| `landlord_responded` | "답 없었어요" → false |
| `has_certified_mail` | "내용증명 보냈고" → true |
| `has_transfer_records` | "이체내역도 있어요" |
| `has_lien_registration` | "그 전 10일에 임차권등기 신청해서 등기했어요" → true |
| `registry_check` | "등기부도 확인했어요" |

→ 15개 드러남, hidden = 16 − 15 = **1** → `low` (0-6) 최소값 ✓

### 질문받아야 드러나는 정보 (숨겨진 1개)

| 슬롯 | GT value | 페르소나 발현 |
|---|---|---|
| `has_kakao_records` | false | "카톡은 안 썼어요. 내용증명으로만 했어요." |

---

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 15개 슬롯 일괄 수집

### Turn 1 — 카톡 기록

> **AI**: 집주인과 카톡이나 문자로 얘기 나눈 적은 있나요?
>
> **의뢰인**: 아니요. 내용증명으로만 했어요.

수집: `has_kakao_records` = false

### Turn 2 — 수집 완료 확인

> **AI**: 말해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 남기실 내용이 있나요?
>
> **의뢰인**: *(엄격+범위좁힘: `open_question_response`)*
>
> "없어요."

### 대화 종료 조건

- 체크리스트 16개 항목 전부 수집 완료
- 추가 법률 쟁점 없음 (v1 순수)
- 총 2~3턴 예상 (low 극한값 — 골든셋 최소 턴 케이스)

---

## 3. 변환/설계 메모

1. **`fragmented × low` 정책 검증**: §2-3 low 구간(hidden 0–6)에 최소값 1로 안착. 골든셋 전체 최소 hidden. §2-1 fragmented 정의 "단답 + 자발 부연 없음"이 low에서는 "문답식 정보 나열"로 발현 — 단답이 슬롯 단위로 조각조각 이어붙는 형태. 007(high, 2문장 극단)과 정반대 극점.

2. **`landlord_responded: false` 확장**: 006에 이어 두 번째. 그러나 발현 정황 완전 다름 — 006은 카톡 읽음 표시 후 무응답, 010은 내용증명 수령 후 무응답. baseline 비교 시 IA가 무응답을 어떻게 표현하는지(false vs unknown) 확인 지점.

3. **모든 절차 이행 시나리오**: 007이 유일했던 "완벽 대응 후 부분 미반환" 패턴 확장. 010은 전액 미반환 + 완벽 대응 조합 — 법률 상담에서 실제 가장 흔한 유형 중 하나이나 골든셋에 부족했던 표본. `unreturned_amount = deposit_amount` + 모든 증거·권리보전 슬롯 true.

4. **fragmented 톤 발현 지점**: `proactive_speech_pool`에 감정 표현 배제. "말한 대로예요" / "특별히 더 드릴 말씀은 없어요" 같은 단문 배치. `open_question_response`도 기본값에서 축약("없어요."). uncertainty_phrases도 단문 위주. IA가 fragmented 톤 인식하고 후속 질문 설계하는지 관찰 지점.

5. **45세 남성 공무원 페르소나**: 001(27M IT), 003(38M 자영업), 007(35M IT) → 30-40대 남성 편중이나 직업 신규 진입(공무원). 절차 능숙함이 페르소나 자연성 강화.

6. **`expected_ia_turns 3`**: 골든셋 전체 최소 예상 턴. 001(8)·009(5)·010(3). low 페르소나별 턴 수 스펙트럼 데이터 확보.
