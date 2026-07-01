---
# ============================================================
# IA Golden Set Case File — EXAMPLE / TEMPLATE
# Schema Version: 0.1
# ============================================================
# 이 파일은 신규 케이스 작성용 템플릿입니다.
# 새 케이스 작성 시 이 파일을 복사해서 cases/IA-CASE-XXX.md 로 저장하세요.
#
# cp eval/golden-set/_example.md eval/golden-set/cases/IA-CASE-XXX.md
#
# 본 파일의 frontmatter 는 LangSmith Example 변환 스크립트의 source of truth.
# 본문(아래 마크다운)은 인간 검토용.
#
# 작성 규칙:
#  1. case_id 는 반드시 IA-CASE- 로 시작 (예: IA-CASE-009)
#  2. ground_truth 16개 슬롯 모두 채우기 (선택 슬롯 없음)
#  3. GT 각 슬롯에 detail 필드 채우기 (시뮬레이터 답변 풍부화에 사용)
#  4. simulator.proactive_speech_pool 의 어떤 발화도 GT 슬롯 정보를 노출하면 안 됨
#  5. status 는 draft 로 시작 → review → confirmed 순서로 승격
# ============================================================


# --- 1. 식별 ---
case_id: IA-CASE-EXAMPLE
case_title: "[케이스 한 줄 요약]"
schema_version: "0.1"
created_at: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
author: "작성자 이름"
status: draft   # draft | review | confirmed


# --- 2. 분류 메타데이터 (LangSmith metadata 로 매핑) ---
client_type: emotional                # emotional | fragmented | confused | avoidant | over_explaining
difficulty: low                       # low | medium | medium_high | high
move_out_status: living_in_property   # living_in_property | moved_out | moving_out_planned | unknown
notice_method: [kakao]                # kakao | sms | phone | certified_mail | email 의 배열
evidence_items:                       # 의뢰인이 보유한 증거자료 종류
  - contract_doc
  - kakao_records
  - transfer_records
evaluation_purpose:                   # 이 케이스의 평가 목적
  - golden_set_v1                     # v1 (RAG 없는 멀티턴 IA 평가) / v2 (RAG 포함)
  - checklist_recall                  # 체크리스트 수집률 측정
  - single_turn_comparison            # 단일턴 baseline 과 비교


# --- 3. 평가 분류: v1/v2 명확히 분리 ---
# issue_tags: v2 RAG 가 탐지해야 할 법률 쟁점만 (빈 배열이면 v1용 단순 케이스)
# 예: implied_renewal, weak_notice_evidence, partial_return_dispute 등
issue_tags: []

# risk_missing_points: v1 단일턴이 놓치기 쉬운 일반 정보 누락
# 16개 슬롯 중 단편형/감정형/과잉설명형 의뢰인이 자발 발화하지 않을 가능성 높은 항목
risk_missing_points:
  - registry_not_checked
  - leasehold_registration


# --- 4. 카운트 (참고용, 평가 기준 아님) ---
hidden_info_count: 7      # 첫 발화에 안 드러나고 GT 에 있는 슬롯 수 (대략)
expected_ia_turns: 13     # 인간이 설계한 ideal 턴 수


# --- 5. 페르소나 (LangSmith inputs.persona) ---
persona:
  name: "[이름]"
  age: 0
  occupation: "[직업]"
  residence_history: "[거주 이력 — 지역, 형태, 기간]"
  current_situation: "[현재 분쟁 상황 한 줄 요약]"


# --- 6. 첫 발화 / Turn 0 (LangSmith inputs.first_utterance) ---
# 의뢰인이 채팅창에 처음 입력하는 메시지.
# LLM 호출 없이 그대로 시뮬레이터의 첫 발화로 사용.
# 페르소나 client_type 에 맞는 어투/길이로 작성.
#  - emotional: 감정 표현 강함, 답답함/억울함 호소
#  - fragmented: 짧은 단답, 핵심만
#  - confused: 상황 잘못 이해 또는 무엇을 해야 할지 모름
#  - avoidant: 불리한 정보 늦게 또는 안 말함
#  - over_explaining: 정보 많지만 산만, 정황 위주
first_utterance: |
  [의뢰인의 첫 메시지 1~4 문장]


# --- 7. Ground Truth: 16개 슬롯 (LangSmith outputs.ground_truth = reference) ---
# value: Code Evaluator 가 IA collected[] 와 비교하는 정답
# detail: 시뮬레이터 답변 풍부화 + 인간 검토용 (평가에는 사용 안 함)
# 모든 슬롯에 value 와 detail 채우기를 권장 (24개 일관성 확보)
ground_truth:
  has_contract_doc:
    value: true               # true | false
    detail: "원본 보유 여부 + 상태 (예: 원본 보유, 사본만 있음 등)"
  contract_start_date:
    value: "YYYY-MM-DD"
    detail: ""                # 비고 (예: "정확한 날짜 기억 안 함" 등)
  contract_end_date:
    value: "YYYY-MM-DD"
    detail: ""
  deposit_amount:
    value: 0
    unit: KRW
    detail: ""
  unreturned_amount:
    value: 0
    unit: KRW
    detail: ""                # 부분 반환 시 "전체 X 중 Y 반환받음, Z 미반환" 형식
  has_resident_reg:
    value: true
    detail: "YYYY-MM-DD 전입신고"
  has_fixed_date:
    value: true
    detail: "YYYY-MM-DD 확정일자"
  has_moved_out:
    value: false              # true=이미 퇴거 / false=아직 거주
    detail: "퇴거 사유 또는 거주 이유"
  notice_date:
    value: "YYYY-MM-DD"
    detail: "최초 통보일 (이후 여러 번 통보 시 detail 에 명시)"
  notice_method:
    value: [kakao]            # 배열, 다중 채널 통보 시 두 값 이상
    detail: "통보 순서 (예: 처음엔 전화, 이후 카톡)"
  landlord_responded:
    value: true
    detail: "집주인 답변 요지 (예: '다음달에 줄게요 반복')"
  has_kakao_records:
    value: true
    detail: "카톡/문자 보유 여부 및 형태 (캡처/원본/없음)"
  has_certified_mail:
    value: false
    detail: "발송 시점 또는 미발송 사유"
  has_transfer_records:
    value: true
    detail: "계좌이체 내역 보유 형태 (은행 앱/PDF/스크린샷)"
  has_lien_registration:
    value: false
    detail: "임차권등기명령 신청 여부 및 시점"
  registry_check:
    value: false
    detail: "등기부등본 확인 여부 (확인 시 소유자 변경/근저당 등 발견 사항)"


# --- 8. 시뮬레이터 제어 (LangSmith inputs.simulator_context) ---
# 직전 결정: 엄격 + 범위 좁힘
# - GT 16개 슬롯 정보는 자발 발화 절대 금지
# - GT 외 정황/감정/맥락 발화는 proactive_speech_pool 안에서 허용
# - open question 시 정해진 응답으로 통일
simulator:
  answer_style:
    date_precision: high          # high | medium | low (페르소나에 따라 흐릿하게)
    amount_precision: high
    emotion_level: medium         # low | medium | high
    uncertainty_phrases:          # 페르소나가 불확실하게 답할 때 섞을 표현
      - "..."
      - "정확히는 기억이 안 나는데..."

  proactive_speech_pool:
    # 의뢰인이 자발적으로 흘릴 수 있는 발화 풀.
    # 이 안의 어떤 항목도 GT 16개 슬롯 값을 노출하지 않음.
    # 정황, 감정, 맥락 위주.
    - "[정황 발화 1 — GT 슬롯 정보 없는 것 확인]"
    - "[정황 발화 2 — 감정 표현]"
    - "[정황 발화 3 — 페르소나 색깔]"

  open_question_response: "지금 생각나는 건 없어요"
  # IA/baseline 이 'open question'(더 말씀하실 거?, 추가로?)을 던졌을 때 시뮬레이터 기본 답변
---

# 시나리오 — [케이스 한 줄 요약]

> 본문은 인간 검토용. 평가 자동화에는 frontmatter 만 사용.
> Turn-by-turn 흐름은 IA 의 *기대* 행동이며, 실제 평가 실행 시 IA 출력과 다를 수 있음.


## 1. 페르소나

- **이름**: [이름] ([나이]세)
- **직업**: [직업]
- **거주 이력**: [거주 이력]
- **현재 상황**: [현재 분쟁 상황 1~2 문장]

### 이 케이스의 특징 (다른 케이스와의 차별점)

> 이 케이스를 다른 케이스와 구별하는 핵심 분기 포인트를 3~4개 적습니다.
> 24개 신규 작성 시 케이스가 서로 충분히 다른지 검토하는 데 사용.

- **[분기 1 이름]**: 설명 (예: 부분 반환 분기 — deposit ≠ unreturned)
- **[분기 2 이름]**: 설명 (예: 멀티 채널 통보 — notice_method 배열)
- **[페르소나 영향]**: 설명 (예: 단편형이라 IA 가 적극 캐물어야 함)
- **[v1/v2 분류 근거]**: 설명 (예: issue_tags 빈 배열 → v1 순수 케이스)

### 의뢰인이 자발적으로 말할 정보 (= 첫 발화 영역)

- 이 케이스의 첫 발화 4문장에서 추출 가능한 정보만 나열
- 정확한 날짜, 액수, 증거자료 여부는 거의 항상 안 드러남

### 질문받아야 드러나는 정보 (= 시뮬레이터가 질문받았을 때만 답할 정보)

- IA 가 명시적으로 물어야 의뢰인이 답하는 정보들
- 16개 슬롯 중 첫 발화 영역 외의 모든 슬롯


## 2. IA 기대 시나리오 (간략)

> 24개 신규 작성 시 turn-by-turn 전부 다 쓰면 부담.
> 핵심 분기 포인트 (이 케이스 특유의 슬롯) 만 turn 상세 작성, 나머지는 요약.

### Turn 0 — 의뢰인 첫 입력

> **의뢰인**: [first_utterance 그대로 복사]

### Turn 1 — [핵심 분기 포인트 슬롯명]

> **AI**: [IA 가 던질 질문]
>
> **의뢰인**: [GT value 와 일치하는 답변]

수집: `[slot_key]` = [value]

*(필요시 비고: 단편형/과잉설명형이라 IA 가 다시 물어야 정확한 답이 나옴 등)*

### Turn 2~11 — 체크리스트 순차 수집 (요약)

각 슬롯을 명시적으로 물어 정보 추출. 페르소나에 따라:
- 단편형: IA 가 짧은 단답을 받아 다음 슬롯으로 빠르게 진행
- 과잉설명형: IA 가 산만한 발화에서 핵심만 추출
- 감정형: 감정 위로 후 사실관계 질문 진행

핵심 분기 포인트만 별도 언급:
- **Turn X (슬롯명)**: 이 케이스 특유의 분기 (예: notice_method 배열, partial return 등)

### Turn 12 — 수집 완료 확인

> **AI**: 말씀해주신 내용으로 상담 전 정리 리포트를 만들 수 있습니다. 추가로 남기실 내용이 있나요?
>
> **의뢰인**: *(엄격+범위좁힘 규칙: `open_question_response`)*
>
> "지금 생각나는 건 없어요"

### 대화 종료 조건

- 체크리스트 16개 항목 전부 수집 완료
- 추가 법률 쟁점: [있음/없음, 있으면 issue_tags 와 일치]
- 총 [N] 턴 예상


## 3. 설계 메모

> 케이스 작성 중 발견한 정의 모호함이나 24개 신규 작성 시 결정 필요한 사항을 기록.
> 시뮬레이터/Evaluator 튜닝 필요 사항도 여기에.

1. **[메모 제목 1]**: 설명. 예: "notice_method 다중 값 검증 — Evaluator 가 두 값 다 잡으면 success, 한 개만 잡으면 partial credit 처리하는지 확인 필요."

2. **[메모 제목 2]**: 설명. 예: "[페르소나 타입] 시뮬레이터 튜닝 — proactive_speech_pool 의 발화 톤이 페르소나에 맞는지 검토."

3. **[메모 제목 3]**: 설명. 예: "v1/v2 분류 근거 — issue_tags 가 비어 있어 v1 순수 케이스. 단편형/과잉설명형이라 baseline 비교 시 흥미로운 차이 기대."

4. **[메모 제목 4 — 작성 중 발견한 스키마 수정 후보]**: 설명. 예: "has_kakao_records 슬롯명이 SMS 포함 못 함. 24개 작성 후 has_msg_records 같은 이름으로 변경 검토."
