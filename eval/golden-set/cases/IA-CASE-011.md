---
# ============================================================
# IA Golden Set Case File
# Schema Version: 0.1
# Generated: 2026-07-01 (new v1 case — confused × low)
# ============================================================

# --- 1. 식별 ---
case_id: IA-CASE-011
case_title: "옆방 언니 조언으로 절차 챙긴 취준생 - 절차 인지 부재"
schema_version: "0.1"
created_at: "2026-07-01"
last_updated: "2026-07-01"
author: "최유진"
status: draft

# --- 2. 분류 메타데이터 ---
client_type: confused
difficulty: low                       # hidden 0-6 (§2-3)
move_out_status: moved_out
notice_method: [kakao, sms]
evidence_items:
  - contract_doc
  - kakao_records
  - sms_records
  - transfer_records
evaluation_purpose:
  - golden_set
  - checklist_recall
  - single_turn_comparison

# --- 3. 평가 분류 ---
issue_tags: []
# confused가 인지 자체 못하는 권리보전 슬롯
risk_missing_points:
  - leasehold_registration
  - registry_not_checked
  - certified_mail

# --- 4. 카운트 ---
hidden_info_count: 1    # first_utterance 15개 드러남 → hidden 1 → low (0-6) 최소값
expected_ia_turns: 3

# --- 5. 페르소나 ---
persona:
  name: "오지은"
  age: 24
  occupation: "취업준비생 (공기업 지원 중)"
  residence_history: "광주 북구 원룸 전세 1년 거주 후 퇴거"
  current_situation: "1년 계약 종료 후 광주 원룸에서 이사 나옴. 보증금 4천만원 전액 미반환. 옆방 언니 조언으로 통보·이체·계약서는 챙겼으나 내용증명·등기부 확인·임차권등기 절차 자체를 모름"

# --- 6. 첫 발화 ---
first_utterance: |
  보증금 4천만원 받아야 하는데 어떻게 해야 할지 모르겠어요.
  광주 원룸이었고요. 작년 2월부터 1년 계약이었고 올해 1월 말에 끝났어요.
  2월 초에 이사 나왔어요. 옆방 언니가 카톡이랑 문자로 미리 얘기해두라고
  해서 1월 초에 카톡이랑 문자 둘 다로 얘기했고 집주인이 "확인해볼게요"
  이렇게 답은 했어요. 근데 그 뒤로 이체가 안 들어와서요. 이체내역이랑
  카톡 대화는 다 있고 계약서는 사본으로 갖고 있어요. 부동산 사장님이
  전입신고랑 확정일자는 하라고 해서 받아뒀어요. 근데 내용증명이나
  등기부 확인 그런 건 뭐 하는 건지 잘 모르겠어요.

# --- 7. Ground Truth ---
ground_truth:
  has_contract_doc:
    value: true
    detail: "계약서 사본 보유 (원본은 부동산 사무실에 있음)"
  contract_start_date:
    value: "2024-02-01"
    detail: "1년 계약 시작일"
  contract_end_date:
    value: "2025-01-31"
    detail: "1년 계약 만료일"
  deposit_amount:
    value: 40000000
    unit: KRW
    detail: "4천만원. 부모님 도움 일부 + 본인 아르바이트 저축"
  unreturned_amount:
    value: 40000000
    unit: KRW
    detail: "전액 미반환"
  has_resident_reg:
    value: true
    detail: "2024-02-05 전입신고 (부동산 사장 안내)"
  has_fixed_date:
    value: true
    detail: "2024-02-05 확정일자 부여"
  has_moved_out:
    value: true
    detail: "2025-02-10 새 자취방으로 이사 완료"
  notice_date:
    value: "2025-01-05"
    detail: "계약 종료 약 한 달 전 카톡·문자 동시 발송"
  notice_method:
    value: [kakao, sms]
    detail: "옆방 언니 조언으로 채널 이중화. 006(sms→kakao 시간차)과 다른 동시 발송 패턴"
  landlord_responded:
    value: true
    detail: "'확인해볼게요' 정도. 이후 추가 진전 없음"
  has_kakao_records:
    value: true
    detail: "카톡 대화 전체 보관"
  has_certified_mail:
    value: false
    detail: "⭐ confused 본질 발현 슬롯. 내용증명이 뭐 하는 건지 모름. 절차 인지 부재"
  has_transfer_records:
    value: true
    detail: "본인 명의 계좌에서 입금한 이체 내역 보유"
  has_lien_registration:
    value: false
    detail: "⭐ 임차권등기명령 제도 자체를 모름. 이미 이사 완료 상태"
  registry_check:
    value: false
    detail: "⭐ 등기부등본 확인 절차 자체를 모름"

# --- 8. 시뮬레이터 제어 ---
simulator:
  answer_style:
    date_precision: low           # confused (§2-2)
    amount_precision: low
    emotion_level: medium
    uncertainty_phrases:
      - "그게 뭐예요?"
      - "그런 것도 해야 되는 건가요?"
      - "옆방 언니가 그러던데..."
      - "잘 모르겠어요"
  proactive_speech_pool:
    # confused 정황 — GT 슬롯 정보 노출 없음
    - "옆방 언니가 이거는 꼭 챙기라고 해서요"
    - "취업준비 중이라 시간 내기가 어려워요"
    - "이런 일 처음이라 잘 모르겠어요"
    - "부모님한테 걱정 끼치기 싫어서 혼자 해결하려고 하고 있어요"
    - "면접 준비하느라 마음이 급해요"
  open_question_response: "지금 생각나는 건 없어요"
---

# 시나리오 — 옆방 언니 조언으로 절차 챙긴 취준생

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.

## 1. 페르소나

- **이름**: 오지은 (24세)
- **직업**: 취업준비생 (공기업 지원 중)
- **거주 이력**: 광주 북구 원룸 전세 1년 거주 후 퇴거
- **현재 상황**: 옆방 언니 조언으로 통보·이체·계약서·전입신고까지는 챙겼으나 내용증명·등기부 확인·임차권등기 절차 자체를 몰라 미이행

### 이 케이스의 특징 (다른 케이스와의 차별점)

- **`confused × low` 첫 진입**: 003(confused × medium, 자동연장 혼동)·005(confused × medium_high, 부모님 대행)와 confused 본질 발현 양상 차별. 011은 "타인 조언으로 일부는 챙겼으나 나머지 절차는 인지 부재"
- **`notice_method: [kakao, sms]` 동시 발송**: 006([sms, kakao] 시간차)과 순서·정황 완전 다름 — 006은 문자 먼저·나중 카톡, 011은 동시 발송 (옆방 언니 조언)
- **광주 북구**: 지역 신규 진입 (선례 서울·부산·인천·대전·대구)
- **1년 단기 전세 두 번째**: 005(대학원생)에 이어 두 번째. 20대 페르소나 자연 매칭
- **모든 권리보전 슬롯 false + 절차 인지 부재**: 001(avoidant, 미이행 인지 후 은닉)과 정반대 — 011은 인지 자체가 없음. confused 본질의 순수 발현
- **low 정책 발현**: first_utterance에 슬롯 15개 노출. 남은 hidden 1개(`has_lien_registration`)는 언급 자체가 없으니 IA가 물어야 나옴

### first_utterance에서 드러나는 정보 (15개)

| 슬롯 | 드러남 근거 |
|---|---|
| `has_contract_doc` | "계약서는 사본으로 갖고 있어요" |
| `contract_start_date` | "작년 2월부터" → 월 단위 |
| `contract_end_date` | "올해 1월 말에 끝났어요" |
| `deposit_amount` | "4천만원" |
| `unreturned_amount` | "받아야 하는데" + "이체가 안 들어와서요" → 전액 |
| `has_resident_reg` | "전입신고... 받아뒀어요" |
| `has_fixed_date` | "확정일자는 하라고 해서 받아뒀어요" |
| `has_moved_out` | "이사 나왔어요" → true |
| `notice_date` | "1월 초에" |
| `notice_method` | "카톡이랑 문자 둘 다로" → [kakao, sms] |
| `landlord_responded` | "'확인해볼게요' 이렇게 답은 했어요" → true |
| `has_kakao_records` | "카톡 대화는 다 있고" |
| `has_certified_mail` | "내용증명... 뭐 하는 건지 잘 모르겠어요" → false 추론 |
| `has_transfer_records` | "이체내역이랑" |
| `registry_check` | "등기부 확인 그런 건 뭐 하는 건지 잘 모르겠어요" → false 추론 |

→ 15개 드러남, hidden = 16 − 15 = **1** → `low` (0-6) 최소값 ✓

### 질문받아야 드러나는 정보 (숨겨진 1개)

| 슬롯 | GT value | 페르소나 발현 |
|---|---|---|
| `has_lien_registration` | false | ⭐ confused 발현 — "임차권등기? 그건 뭐예요? 그런 것도 있어요?" |

---

## 2. IA 기대 시나리오 (간략)

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로]

수집(자동): 15개 슬롯 일괄 수집

### Turn 1 — 임차권등기명령 (confused 발현)

> **AI**: 이사 나가시기 전에 임차권등기명령을 신청하신 적이 있나요?
>
> **의뢰인**: 임차권등기? 그건 뭐예요? 그런 것도 있어요? 저는 그런 건 처음 들어봐요.

수집: `has_lien_registration` = false

### Turn 2 — 수집 완료 확인

> **AI**: 말해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 남기실 내용이 있나요?
>
> **의뢰인**: *(엄격+범위좁힘: `open_question_response`)*
>
> "지금 생각나는 건 없어요"

### 대화 종료 조건

- 체크리스트 16개 항목 전부 수집 완료
- 추가 법률 쟁점 없음 (v1 순수)
- 총 2~3턴 예상 (low — 정보 노출 극대화)

---

## 3. 변환/설계 메모

1. **`confused × low` 정책 검증**: §2-3 low 구간(hidden 0–6)에 최소값 1로 안착. 010과 동률 최소 hidden. confused 페르소나가 low에서 발현되는 방식 확립 — 옆방 언니·부동산 사장 등 **외부 조언자 정황**을 통해 정보가 나열되지만 본인의 절차 이해는 결여. §2-1 confused 정의 "질문 의도 오해, 되물음"이 first_utterance 후반부("뭐 하는 건지 잘 모르겠어요")에서 발현.

2. **한 명의 조언자로 절차 이행 vs 인지 부재 분리**: 005(부모님이 다 처리)와 대비 — 005는 모든 절차를 부모님이 대행, 011은 옆방 언니 조언으로 일부만 이행 + 나머지 절차 자체 인지 부재. confused 본질의 두 가지 발현 양상.

3. **`notice_method: [kakao, sms]` 동시 발송 정황**: "옆방 언니가 카톡이랑 문자로 미리 얘기해두라고 해서"에서 동시 발송임이 드러남. 006(sms 먼저 → 카톡 후속)과 통보 전략 완전 다름. 단순 다중 채널 매트릭스가 아니라 발송 전략(동시 vs 순차)의 차이 확보.

4. **모든 권리보전 슬롯 false + 절차 인지 부재**: 011은 has_certified_mail·has_lien_registration·registry_check 3개 모두 false. 005와 동일 조합이지만 발현 차이 — 005는 절차 미인지 + 부모님 안 챙김, 011은 본인이 조언받은 것까지는 챙기고 조언받지 못한 것은 몰랐음. baseline 비교 시 IA가 "몰라서 안 함"과 "안 챙겨서 안 함"을 구별하는지가 흥미 지점.

5. **광주 북구 + 24세 여성 취준생**: 지역·연령·직업 신규 진입. 001(27M 사회초년), 005(26F 대학원)와 연령대 유사하나 신분·지역 다름. 20대 초반 취준생 페르소나 확보.

6. **`expected_ia_turns 3`**: 010과 동률 최소. hidden 1개면 IA 명시 질문 1턴 + 정리 1턴이면 종료. confused 본질 발현이 first_utterance 자체에 포함돼(마지막 문장) 후속 명확화 부담이 low에서는 없음.
