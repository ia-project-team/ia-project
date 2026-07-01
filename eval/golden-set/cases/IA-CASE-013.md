---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-01 (new v1 case — emotional × medium)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-013
case_title: "육아휴직 중 새 세입자 핑계로 보증금 미반환"
schema_version: "0.1"
created_at: "2026-07-01"
last_updated: "2026-07-01"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: emotional
difficulty: medium                    # hidden 7-10 (§2-3)
move_out_status: living_in_property
notice_method: [sms, phone]           # 신규 조합
evidence_items:
  - contract_doc
  - sms_records
  - transfer_records
  - registry_doc
evaluation_purpose:
  - golden_set
  - checklist_recall
  - single_turn_comparison

# --- 3. 평가 분류 ---
issue_tags: []
# emotional이 흐릿하게 답하는 구체값 슬롯 + 미이행 절차
risk_missing_points:
  - contract_start_date
  - notice_date
  - certified_mail
  - leasehold_registration

# --- 4. 카운트 ---
hidden_info_count: 10   # first_utterance 6개 드러남 → hidden 10 → medium (7-10) 상단
expected_ia_turns: 11

# --- 5. 페르소나 ---
persona:
  name: "조하나"
  age: 37
  occupation: "육아휴직 중 회사원 (마케팅 매니저)"
  residence_history: "서울 노원구 아파트 전세 2년 거주"
  current_situation: "2년 계약 종료 후 보증금 1.5억 전액 미반환. 집주인은 매번 '새 세입자 오면 준다'는 답변만 반복. 어린 자녀 육아 중이라 다른 곳 알아볼 여유도 없이 묶여 있는 상태"

# --- 6. 첫 발화 ---
first_utterance: |
  진짜 화가 나서 잠을 못 자겠어요. 5월 말에 계약이 끝났는데 집주인이
  매번 "새 세입자 오면 준다"는 말만 반복하고 있어요. 저는 아기 때문에
  육아휴직 중이라 다른 데 알아볼 여유도 없고, 보증금 1억 5천이 묶여
  있으니까 이러지도 저러지도 못하고 있고요. 문자로도 여러 번 얘기했고
  전화도 몇 번 했는데 답은 오는데 진전이 없어요. 정말 답답해서 어떻게
  해야 할지 모르겠어요.

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
    detail: "2023-06-02 전입신고"
  has_fixed_date:
    value: true
    detail: "2023-06-01 확정일자 부여 (계약일 당일)"
  has_moved_out:
    value: false
    detail: "육아휴직 중 + 보증금 못 받아 계속 거주. 새 집 알아볼 시간·여유 없음"
  notice_date:
    value: "2025-03-15"
    detail: "계약 종료 약 두 달 반 전 첫 문자. 이후 4월 초·중·말 문자 반복 + 5월에 전화 두 번"
  notice_method:
    value: [sms, phone]
    detail: "⭐ 신규 조합. 시간 순서: 문자 여러 번 → 전화. 카톡·내용증명 미사용"
  landlord_responded:
    value: true
    detail: "매번 '새 세입자 오면 준다' 반복. 008(약속 반복)과 유사하나 핑계 유형 다름"
  has_kakao_records:
    value: false
    detail: "집주인과 카톡 사용 안 함. 문자로만"
  has_certified_mail:
    value: false
    detail: "내용증명 발송 안 함. 육아 중이라 절차 진행 여유 부족"
  has_transfer_records:
    value: true
    detail: "보증금 입금 이체 내역 은행 앱에서 확인 가능"
  has_lien_registration:
    value: false
    detail: "아직 거주 중이라 신청 안 함"
  registry_check:
    value: true
    detail: "지난달 등기부등본 확인. 소유자 변경 없음"

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
    # emotional 정황 — GT 슬롯 정보 노출 없음
    - "아기가 아직 어려서 밖에 나가기도 힘들어요"
    - "육아휴직 끝나기 전에 정리하고 싶은데 시간이 너무 없어요"
    - "남편도 회사 다니느라 이거 신경 쓸 여유가 없어요"
    - "아기 옆에서 자꾸 통화하고 답장하니까 애가 자꾸 깨서 미치겠어요"
    - "정말 이렇게 무시당해도 되는 건지 너무 억울해요"
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 육아휴직 중 새 세입자 핑계로 보증금 미반환

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 조하나 (37세)
- **직업**: 육아휴직 중 회사원 (마케팅 매니저)
- **거주 이력**: 서울 노원구 아파트 전세 2년 거주
- **현재 상황**: 계약 종료 후에도 보증금 1.5억 전액 미반환. 어린 자녀 육아 중이라 새 집 알아볼 여유 없이 묶여 있음

### 이 케이스의 특징 (다른 케이스와의 차별점)

- **`emotional × medium` 두 번째 진입**: 006(3교대 간호사, 무응답)과 동일 페르소나·difficulty이나 정황 완전 다름 — 013은 답변 있는 핑계 반복
- **`notice_method: [sms, phone]` 신규 조합**: 선례 다중 채널 `[sms,kakao]`(006), `[kakao,phone]`(008), `[sms,kakao,certified_mail]`(009), `[kakao,sms]`(011)와 4번째 신규 조합. 카톡·내용증명 없이 문자·전화만
- **새 세입자 핑계**: 002(무한 대기)·006(무응답)·008(약속 반복)에 이은 4번째 emotional 발현 정황. "새 세입자 오면 준다"는 실무에서 가장 흔한 지연 핑계
- **서울 노원구**: 지역 신규 진입
- **육아휴직 정황**: `has_certified_mail: false`, `has_lien_registration: false`(거주중)의 정황적 근거. 절차 진행 물리적 여유 부족
- **37세 여성 워킹맘**: 002(29F 마케터)와 직업군 겹치나 세대·상황(육아휴직) 완전 차별

### first_utterance에서 드러나는 정보 (6개)

| 슬롯 | 드러남 근거 |
|---|---|
| `contract_end_date` | "5월 말에 계약이 끝났는데" → 월 단위 |
| `deposit_amount` | "1억 5천" |
| `unreturned_amount` | "1억 5천이 묶여 있으니까" → 전액 |
| `has_moved_out` | "이러지도 저러지도 못하고" + "다른 데 알아볼 여유도 없고" → false (거주 중) |
| `notice_method` | "문자로도 여러 번... 전화도 몇 번" → [sms, phone] |
| `landlord_responded` | "매번 '새 세입자 오면 준다'" → true |

→ 6개 드러남, hidden = 16 − 6 = **10** → `medium` (7-10) 상단 ✓

### 질문받아야 드러나는 정보 (숨겨진 10개)

| 슬롯 | GT value | 페르소나 발현 |
|---|---|---|
| `has_contract_doc` | true | 평범 |
| `contract_start_date` | 2023-06-01 | emotional 흐릿 ("2023년 6월... 정확히는 1일이요") |
| `has_resident_reg` | true | 평범 |
| `has_fixed_date` | true | 평범 |
| `notice_date` | 2025-03-15 | emotional 흐릿 ("3월 중순쯤부터... 정확히는 잘...") |
| `has_kakao_records` | false | "카톡은 안 했어요, 문자로만" |
| `has_certified_mail` | false | "내용증명은 못 보냈어요. 애 보느라 그럴 여유가 없어서..." |
| `has_transfer_records` | true | 평범 |
| `has_lien_registration` | false | "아직 못 나갔으니까요" |
| `registry_check` | true | "지난달에 한 번 떼봤어요" |

---

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): `contract_end_date`(월), `deposit_amount`, `unreturned_amount`, `has_moved_out`, `notice_method`, `landlord_responded`

### Turn 1 — 감정 인정과 계약서 확인

> **AI**: 그런 상황 정말 답답하실 것 같아요. 몇 가지 정리를 위해 여쭐게요. 임대차계약서 원본은 갖고 계신가요?
>
> **의뢰인**: 네, 있어요.

수집: `has_contract_doc` = true

### Turn 2 — 계약 시작일과 종료일 정확화

> **AI**: 계약 시작일과 종료일이 정확히 언제인지 알려주실 수 있을까요?
>
> **의뢰인**: 하... 2023년 6월 1일부터 2025년 5월 31일까지 2년이요.

수집: `contract_start_date` = 2023-06-01, `contract_end_date` = 2025-05-31 (정확화)

### Turn 3 — 전입신고와 확정일자

> **AI**: 전입신고와 확정일자는 받으셨나요?
>
> **의뢰인**: 네, 이사 다음 날 전입신고 했고 확정일자는 계약일에 받았어요.

수집: `has_resident_reg` = true, `has_fixed_date` = true

### Turn 4 — 통보 시점 정확화

> **AI**: 첫 문자를 보낸 게 언제였는지 기억나시나요?
>
> **의뢰인**: 3월 중순쯤부터였어요. 정확히는... 3월 15일이었던 것 같아요.

수집: `notice_date` = 2025-03-15

### Turn 5 — 카톡 기록

> **AI**: 문자·전화 외에 카톡으로도 얘기하신 적 있나요?
>
> **의뢰인**: 아니요. 카톡은 안 했어요. 문자로만요.

수집: `has_kakao_records` = false

### Turn 6 — 내용증명

> **AI**: 내용증명은 발송하신 적 있으신가요?
>
> **의뢰인**: 그건 못 보냈어요. 애 보느라 그럴 여유가 없어서요...

수집: `has_certified_mail` = false

### Turn 7 — 계좌이체 내역

> **AI**: 처음 보증금 입금 이체 내역은 남아 있나요?
>
> **의뢰인**: 네, 은행 앱에 있어요.

수집: `has_transfer_records` = true

### Turn 8 — 임차권등기명령

> **AI**: 임차권등기명령을 신청해보신 적은 있나요?
>
> **의뢰인**: 아직 못 나갔으니까요. 신청 안 했어요.

수집: `has_lien_registration` = false

### Turn 9 — 등기부등본

> **AI**: 등기부등본을 확인해보신 적은 있나요?
>
> **의뢰인**: 네, 지난달에 한 번 떼봤어요. 소유자는 그대로였어요.

수집: `registry_check` = true

### Turn 10 — 수집 완료 확인

> **AI**: 말해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 남기실 내용이 있나요?
>
> **의뢰인**: *(엄격+범위좁힘: `open_question_response`)*
>
> "지금 생각나는 건 없어요"

### 대화 종료 조건

- 체크리스트 16개 항목 전부 수집 완료
- 추가 법률 쟁점 없음 (v1 순수)
- 총 10~11턴 예상 (medium — hidden 10)

---

## 3. 변환/설계 메모

1. **`emotional × medium` 두 번째 표본 (006 대비)**: 같은 페르소나·difficulty이나 landlord_responded 분기(false vs true), notice_method(다중 vs 다중 조합 다름), 정황(3교대 vs 육아휴직) 완전 차별. emotional × medium 내에서도 발현 다양성 확보. 페르소나·difficulty 조합의 표본 다양성 검증.

2. **`notice_method: [sms, phone]` 신규 조합의 의미**: 문자·전화만 사용 = 젊은 세대(카톡 선호)와 노년(전화 선호) 사이의 중간 세대 패턴. 37세 워킹맘이 카톡 대신 문자를 선호한 정황 자연스러움 — 집주인 세대·관계 성격 차이 등.

3. **"새 세입자 오면 준다" 지연 핑계**: 실무 자주 등장하는 핑계 유형. 008(다음달·조만간)과 다른 조건부 지연 표현. baseline 비교 시 IA가 이 답변을 landlord_responded=true로 정확히 매핑하는지 + risk_missing_points에 반영하는지 관찰 지점.

4. **육아 정황의 다층 기능**: (a) emotional 페르소나의 분노·억울함 자연 발현, (b) `has_certified_mail: false`·`registry_check: true`·`has_lien_registration: false`의 정황적 근거 제공, (c) `proactive_speech_pool`의 페르소나 색깔 강화. 특히 "아기 옆에서 자꾸 통화하고..." 발화가 GT 노출 없이 정황만 전달하는지 누출 검사 지점.

5. **낮은 시청 상승 시나리오 아님**: 002(무한 대기)·006(무응답)·008(반복 약속)·013(새 세입자 핑계) → emotional 페르소나 4건 모두 "집주인이 답은 하지만 실질 진전 없음" 계열. 향후 020·021(emotional × medium_high)에서 다른 정황 유형(집주인 잠수 후 재등장·근저당 급증 발견 등) 도입 필요.

6. **`expected_ia_turns 11`**: medium 페르소나별 턴 수 데이터 — 003(12, confused), 004(10, avoidant), 006(10, emotional×medium 006), 013(11, emotional×medium 013). emotional 페르소나가 감정 인정 턴 여유분으로 medium 안에서 상단.
