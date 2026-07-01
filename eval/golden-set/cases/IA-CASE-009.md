---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-01 (new v1 case — emotional × low)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-009
case_title: "은퇴 앞둔 전직 교사 3중 채널 통보 보증금 미반환"
schema_version: "0.1"
created_at: "2026-07-01"
last_updated: "2026-07-01"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: emotional
difficulty: low                       # hidden 0-6 (§2-3)
move_out_status: moving_out_planned
notice_method: [sms, kakao, certified_mail]   # 3중 채널 첫 사용
evidence_items:
  - contract_doc
  - kakao_records
  - sms_records
  - certified_mail
  - transfer_records
  - registry_doc
evaluation_purpose:
  - golden_set
  - checklist_recall
  - single_turn_comparison

# --- 3. 평가 분류 ---
issue_tags: []
# emotional이 흐릿하게 답하기 쉬운 구체값 슬롯 + 거주중이라 미이행한 권리보전
risk_missing_points:
  - contract_start_date
  - notice_date
  - leasehold_registration

# --- 4. 카운트 ---
hidden_info_count: 2    # first_utterance 14개 드러남 → hidden 2 → low (0-6)
expected_ia_turns: 5

# --- 5. 페르소나 ---
persona:
  name: "강태식"
  age: 65
  occupation: "전직 중학교 교사 (2025년 2월 정년 퇴임)"
  residence_history: "대전 유성구 아파트 전세 2년 거주"
  current_situation: "정년 퇴임 후 외곽 이사 예정이었으나 2년 계약 종료 후 보증금 2.5억 전액 미반환. 3중 채널로 반복 통보했으나 집주인은 매번 '조금만 기다려달라' 답변만 반복. 노후자금 묶여 이사 계획 무기한 연기"

# --- 6. 첫 발화 ---
first_utterance: |
  제가 이번에 정년 퇴임하고 외곽으로 이사 가려고 준비 중이었는데,
  대전 유성구 아파트 전세 2년이 4월 말에 끝났는데도 보증금 2억 5천만원을
  아직 하나도 못 받고 있어요. 계약 끝나기 두 달쯤 전인 3월 초에 문자로
  처음 얘기했고, 그 뒤로 카톡으로도 여러 번, 4월 초에는 내용증명까지
  발송했어요. 그런데 집주인은 매번 "조금만 기다려달라"는 답만 반복해요.
  등기부는 저번 달에 한 번 떼봤고 카톡·문자·이체내역 다 캡처해뒀고요.
  계약서 원본도 있고 전입신고랑 확정일자도 계약 당시에 다 받아뒀어요.
  이 나이에 이런 일이 생기니까 진짜 억울해서 잠도 안 와요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 원본 보유"
  contract_start_date:
    value: "2023-05-01"
    detail: "2년 계약 시작일"
  contract_end_date:
    value: "2025-04-30"
    detail: "2년 계약 만료일"
  deposit_amount:
    value: 250000000
    unit: KRW
    detail: "2억 5천만원. 정년 퇴임 후 노후자금 겸용"
  unreturned_amount:
    value: 250000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2023-05-02 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-05-01 확정일자 부여"
  has_moved_out:
    value: false
    detail: "외곽 이사 예정이었으나 보증금 못 받아 무기한 연기. 현재 거주 중 (moving_out_planned)"
  notice_date:
    value: "2025-03-01"
    detail: "계약 종료 약 두 달 전 첫 문자 통보. 이후 3월 중순·말·4월 초 카톡 반복 + 4월 10일 내용증명"
  notice_method:
    value: [sms, kakao, certified_mail]
    detail: "⭐ 3중 채널 첫 사용. 시간 순서: 문자 → 카톡 → 내용증명"
  landlord_responded:
    value: true
    detail: "매 통보마다 '조금만 기다려달라', '곧 정리된다' 반복. 반환 없음"
  has_kakao_records:
    value: true
    detail: "카톡 대화 전체 캡처 보관"
  has_certified_mail:
    value: true
    detail: "2025-04-10 발송본 + 수령 통지 보관"
  has_transfer_records:
    value: true
    detail: "최초 보증금 입금 이체 내역 은행 앱에서 확인 가능"
  has_lien_registration:
    value: false
    detail: "아직 거주 중이라 신청 안 함"
  registry_check:
    value: true
    detail: "지난달 등기부등본 확인. 소유자 변경 없음, 근저당 소액"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: medium        # emotional (§2-2)
    amount_precision: medium
    emotion_level: high
    uncertainty_phrases:
      - "하..."
      - "정확히는 기억이..."
      - "그게 언제였더라..."
      - "너무 답답해서 자세히 기억이 안 나요"
  proactive_speech_pool:
    # emotional 정황 보조 — GT 슬롯 정보 직접 노출 없음
    - "60 넘어서 이런 일 겪을 줄은 몰랐어요"
    - "은퇴하고 이사갈 곳도 다 봐놨는데 이러니 아무것도 못 하고 있어요"
    - "젊은 집주인이라 저를 우습게 보는 것 같아요"
    - "잠도 잘 안 오고 혈압도 오르는 것 같아요"
    - "학생들 가르치면서 평생 성실하게 살았는데 이런 대우를 받다니 억울해요"
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 은퇴 앞둔 전직 교사 3중 채널 통보 보증금 미반환

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 강태식 (65세)
- **직업**: 전직 중학교 교사 (2025년 2월 정년 퇴임)
- **거주 이력**: 대전 유성구 아파트 전세 2년 거주
- **현재 상황**: 정년 퇴임 후 외곽 이사 예정이었으나 보증금 2.5억 전액 미반환으로 이사 계획 무기한 연기

### 이 케이스의 특징 (다른 케이스와의 차별점)

- **`emotional × low` 첫 진입**: 002·006(emotional 여성 20-30대)과 세대·성별·지역 전면 차별. 65세 남성 은퇴 교사
- **`notice_method: [sms, kakao, certified_mail]` 3중 채널 첫 사용**: 선례 최대 2중(006 `[sms,kakao]`, 008 `[kakao,phone]`). 3중 첫 진입
- **`moving_out_planned` 첫 emotional 조합**: 003(confused)에 이은 두 번째 `moving_out_planned`. emotional은 처음
- **대전 유성구**: 지역 신규 진입 (선례 서울·부산·인천·광주·대구)
- **`landlord_responded: true`이지만 답변 실체 없음**: 008(약속 반복)과 유사 패턴이지만 채널·나이·감정 톤 완전 다름
- **low 정책 발현**: first_utterance에 슬롯 14개 노출. 남은 hidden 2개(`contract_start_date` 구체값, `has_lien_registration`)는 IA 명시 질문 필요

### first_utterance에서 드러나는 정보 (14개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_contract_doc` | "계약서 원본도 있고" |
| `contract_end_date` | "4월 말에 끝났는데" |
| `deposit_amount` | "2억 5천만원" |
| `unreturned_amount` | "하나도 못 받고 있어요" → 전액 |
| `has_resident_reg` | "전입신고... 다 받아뒀어요" |
| `has_fixed_date` | "확정일자도 계약 당시에 다 받아뒀어요" |
| `has_moved_out` | "이사 가려고 준비 중이었는데" → false + moving_out_planned |
| `notice_date` | "3월 초에 문자로 처음" → 대략 시점 |
| `notice_method` | "문자로... 카톡으로... 내용증명까지" → [sms, kakao, certified_mail] |
| `landlord_responded` | "매번 '조금만 기다려달라'는 답만 반복" |
| `has_kakao_records` | "카톡·문자·이체내역 다 캡처해뒀고요" |
| `has_certified_mail` | "내용증명까지 발송했어요" |
| `has_transfer_records` | "이체내역 다 캡처해뒀고요" |
| `registry_check` | "등기부는 저번 달에 한 번 떼봤고" |

→ 14개 드러남, hidden = 16 − 14 = **2** → `low` (0-6) ✓

### 질문받아야 드러나는 정보 (숨겨진 2개)

| 슬롯 | GT value | 페르소나 발현 |
|---|---|---|
| `contract_start_date` | 2023-05-01 | 정확값 캐물어야 답 ("2023년 5월 1일이었어요") |
| `has_lien_registration` | false | 거주 중이라 신청 안 함 ("아직 안 나갔으니 신청 못 했어요") |

---

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): `has_contract_doc`, `contract_end_date`(월), `deposit_amount`, `unreturned_amount`, `has_resident_reg`, `has_fixed_date`, `has_moved_out`, `notice_date`(대략), `notice_method`, `landlord_responded`, `has_kakao_records`, `has_certified_mail`, `has_transfer_records`, `registry_check`

### Turn 1 — 계약 시작일과 통보 시점 정확화

> **AI**: 계약 시작일과 첫 문자 발송일이 정확히 언제였는지 알려주실 수 있을까요?
>
> **의뢰인**: 하... 계약은 2023년 5월 1일에 시작했고, 문자는 3월 1일에 보냈어요. 그때가 계약 끝나기 두 달 전이었거든요.

수집: `contract_start_date` = 2023-05-01, `notice_date` = 2025-03-01 (정확화)

### Turn 2 — 임차권등기명령

> **AI**: 임차권등기명령을 신청하신 적은 있으신가요?
>
> **의뢰인**: 아직 이사를 못 갔으니까 그건 신청 안 했어요. 나가야 신청할 수 있다고 들어서요.

수집: `has_lien_registration` = false

### Turn 3 — 수집 완료 확인

> **AI**: 말해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 남기실 내용이 있나요?
>
> **의뢰인**: *(엄격+범위좁힘: `open_question_response`)*
>
> "지금 생각나는 건 없어요"

### 대화 종료 조건

- 체크리스트 16개 항목 전부 수집 완료
- 추가 법률 쟁점 없음 (v1 순수)
- 총 3~5턴 예상 (low — 극한 빠른 진행)

---

## 3. 변환/설계 메모

1. **`emotional × low` 정책 검증**: §2-3 low 구간(hidden 0–6)에 정확히 2로 안착. §2-3 노트("`low` 케이스는 first_utterance에 슬롯 10–16개 노출") 준수. emotional 페르소나이지만 감정 표현("잠도 안 와요", "억울해서")과 사실 나열이 병존 — 감정이 사실을 배제하지 않는 emotional × low 표본.

2. **3중 채널 통보의 의미**: sms → kakao → certified_mail 시간 순서로 강도 상승. 노년 페르소나가 절차에 능숙함을 보여주는 사실관계. `weak_notice_evidence` 우려 없음. 다중 채널 조합 매트릭스 확장: `[sms,kakao]`(006), `[kakao,phone]`(008), `[sms,kakao,certified_mail]`(009).

3. **`moving_out_planned` + `has_lien_registration: false` 조합**: 임차권등기는 통상 퇴거 직전 신청. 이 케이스는 이사 자체가 무기한 연기됐으므로 미신청 상태 자연스러움. 003(같은 상태, 등기 미신청)과 동일 패턴이나 003은 confused, 009는 emotional로 페르소나 차이.

4. **low에서의 emotional 발현 전략**: `simulator.emotion_level: high` + `uncertainty_phrases`에 감정 흐릿함("정확히는 기억이...", "너무 답답해서") 배치. first_utterance는 정보 풍부하되 감정 톤 유지. 후속 답변에서 페르소나 본질이 발현되도록 설계.

5. **65세 남성 노년 페르소나 첫 진입**: 001(27M), 002(29F), 003(38M), 004(42F), 005(26F), 006(31F), 007(35M), 008(33F) → 20-40대 편중. 009는 60대 남성으로 세대 분포 확장. 노후자금·정년퇴임 등 정황이 페르소나 자연성 강화.

6. **`expected_ia_turns 5`**: 001(8), 009(5). low 페르소나별 턴 수 데이터. hidden 2개면 이론적 최소 2턴이지만 첫 답변 정확화·감정 반응 여유분 감안.
