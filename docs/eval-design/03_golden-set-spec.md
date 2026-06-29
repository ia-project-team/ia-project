# IA Golden Set — 스펙 & 페르소나 분류체계

> 작성일: 2026.06.28
> 작성자: 최유진
> 대상: IA(Intake Assistant) 골든셋 v1 (목표 30케이스, 현재 8케이스)
> 위치: `eval/golden-set/cases/IA-CASE-NNN.md`

---

## 0. 문서 목적 & 범위

### 0-1. 평가 한 줄

LLM이 골든셋 케이스의 Ground Truth(16슬롯)를 연기하는 **가상 의뢰인 시뮬레이터**와 IA가 멀티턴 대화한다. IA가 채운 `collected[]`와 GT를 비교해 수집률·정확도를 측정한다.

### 0-2. 이 문서의 목적

골든셋이 "케이스 수 늘리기"가 아니라 **검증된 큐레이션 자산**이 되도록, 다음을 확립한다:

1. **스키마** — frontmatter 전 필드 정의 (single source of truth)
2. **페르소나 분류체계** — 5종 정식 정의 + answer_style 매핑 + 분포 목표
3. **작성·검증 절차** — status 워크플로 + GT 누출 검사 게이트
4. **기존 케이스 보완 계획** — 남은 22케이스 작성 우선순위

### 0-3. 표기 규칙

- 🟩 = `simulator.ts` / `_example.md` / 기존 케이스에 **이미 있는 사실**
- 🟦 = 본 문서에서 **새로 정한 결정**

---

## 1. 골든셋 스키마

### 1-1. 원칙

**frontmatter = single source of truth.** LangSmith Example 변환 스크립트가 frontmatter만 읽는다. 본문 마크다운은 인간 검토용이며 평가 자동화에 사용되지 않는다.

### 1-2. 전 필드 정의

#### 1) 식별 (Identification)

| 필드 | 타입 | 필수 | 설명 | 예시 | 출처 |
|---|---|---|---|---|---|
| `case_id` | string | ✓ | `IA-CASE-` 접두사 + 3자리 일련번호 | `IA-CASE-009` | 🟩 |
| `case_title` | string | ✓ | 한 줄 요약 | `"단순 보증금 미반환"` | 🟩 |
| `schema_version` | string | ✓ | 스키마 버전 | `"0.1"` | 🟩 |
| `created_at` | date | ✓ | YYYY-MM-DD | `"2026-06-21"` | 🟩 |
| `last_updated` | date | ✓ | YYYY-MM-DD | `"2026-06-21"` | 🟩 |
| `author` | string | ✓ | 작성자 | `"최유진"` | 🟩 |
| `status` | enum | ✓ | `draft \| review \| confirmed` | `draft` | 🟩 |

#### 2) 분류 메타 (Classification Metadata)

| 필드 | 타입 | 필수 | 설명 | 예시 | 출처 |
|---|---|---|---|---|---|
| `client_type` | enum | ✓ | 페르소나 5종 (§2-1) | `emotional` | 🟩 |
| `difficulty` | enum | ✓ | `low \| medium \| medium_high \| high` — §2-3에 따라 `hidden_info_count` 기반으로 매핑 | `low` | 🟩 enum / 🟦 매핑 |
| `move_out_status` | enum | ✓ | `living_in_property \| moved_out \| moving_out_planned \| unknown` | `moved_out` | 🟩 |
| `notice_method` | string[] | ✓ | `kakao \| sms \| phone \| certified_mail \| email`의 배열 (다중 가능) | `[kakao, certified_mail]` | 🟩 |
| `evidence_items` | string[] | ✓ | 보유 증거자료 종류 | `[contract_doc, kakao_records]` | 🟩 |
| `evaluation_purpose` | string[] | ✓ | `golden_set_v1 \| checklist_recall \| single_turn_comparison` 등 | `[golden_set_v1, checklist_recall]` | 🟩 |

#### 3) 평가 분류 (v1/v2 분리)

| 필드 | 타입 | 필수 | 설명 | 출처 |
|---|---|---|---|---|
| `issue_tags` | string[] | ✓ | **v2 RAG 평가용 법률 쟁점 태그.** v1 순수 케이스는 빈 배열 `[]` | 🟩 |
| `risk_missing_points` | string[] | ✓ | v1 단일턴이 놓치기 쉬운 일반 정보 항목 | 🟩 |

#### 4) 카운트 (참고용)

| 필드 | 타입 | 필수 | 설명 | 출처 |
|---|---|---|---|---|
| `hidden_info_count` | int | ✓ | 첫 발화에 안 드러나고 GT에 있는 슬롯 수 (0–16). **difficulty 결정 근거** (§2-3) | 🟩 정의 / 🟦 difficulty 매핑 기준 |
| `expected_ia_turns` | int | ✓ | 인간이 설계한 ideal 턴 수 | 🟩 |

> ⚠️ 카운트는 평가 기준이 아니다. 어디까지나 분류 보조·검토용. 실제 평가는 GT vs `collected[]` 비교.

#### 5) 페르소나 (Persona)

| 필드 | 타입 | 필수 | 설명 | 출처 |
|---|---|---|---|---|
| `persona.name` | string | ✓ | 가상 이름 | 🟩 |
| `persona.age` | int | ✓ | 나이 | 🟩 |
| `persona.occupation` | string | ✓ | 직업 | 🟩 |
| `persona.residence_history` | string | ✓ | 거주 이력 | 🟩 |
| `persona.current_situation` | string | ✓ | 분쟁 상황 한 줄 | 🟩 |

#### 6) 첫 발화 (First Utterance)

| 필드 | 타입 | 필수 | 설명 | 출처 |
|---|---|---|---|---|
| `first_utterance` | string (multiline) | ✓ | 의뢰인이 채팅창에 처음 입력하는 메시지. LLM 호출 없이 그대로 시뮬레이터의 첫 발화로 사용. `client_type` 어투 반영 | 🟩 |

#### 7) Ground Truth (16슬롯)

| 슬롯 분류 | 슬롯 key | 타입 |
|---|---|---|
| 계약 정보 | `has_contract_doc` / `contract_start_date` / `contract_end_date` | bool / date / date |
| 금전 정보 | `deposit_amount` / `unreturned_amount` | int (KRW) / int (KRW) |
| 거주 정보 | `has_resident_reg` / `has_fixed_date` / `has_moved_out` | bool / bool / bool |
| 통보 정보 | `notice_date` / `notice_method` / `landlord_responded` | date / string[] / bool |
| 증거 자료 | `has_kakao_records` / `has_certified_mail` / `has_transfer_records` | bool / bool / bool |
| 권리 보전 | `has_lien_registration` / `registry_check` | bool / bool |

각 슬롯의 frontmatter 구조:

```yaml
slot_key:
  value: <type>                 # Code Evaluator가 IA collected[]와 비교하는 정답
  unit: <unit, optional>        # 금액 슬롯에만 사용 (예: KRW)
  detail: "<string, optional>"  # 시뮬레이터 답변 풍부화 + 인간 검토용. 평가에는 사용 안 함
```

> 🟦 권고: **모든 16슬롯에 `detail` 채우기.** detail이 없으면 시뮬레이터 답변이 단조롭다.

#### 8) 시뮬레이터 제어 (Simulator)

| 필드 | 타입 | 필수 | 설명 | 출처 |
|---|---|---|---|---|
| `simulator.answer_style.date_precision` | enum | ✓ | `low \| medium \| high` | 🟩 |
| `simulator.answer_style.amount_precision` | enum | ✓ | `low \| medium \| high` | 🟩 |
| `simulator.answer_style.emotion_level` | enum | ✓ | `low \| medium \| high` | 🟩 |
| `simulator.answer_style.uncertainty_phrases` | string[] | ✓ | 불확실하게 답할 때 섞을 표현 | 🟩 |
| `simulator.proactive_speech_pool` | string[] | ✓ | 자발 발화 풀. **GT 16슬롯 정보 노출 절대 금지** (§3-2 G5) | 🟩 |
| `simulator.open_question_response` | string | ✓ | open question에 대한 통일 응답 | 🟩 |

### 1-3. 엄격 규칙 (🟩 코드 결정사항)

1. **GT 16슬롯 자발 발화 금지.** 어떤 슬롯 값도 의뢰인이 먼저 말하지 않는다. IA가 명시적으로 물어야만 답한다.
2. **GT 외 정황·감정·맥락**만 `proactive_speech_pool`에서 허용.
3. **Open question(추가 말씀? 더 있나요?)** 응답은 `open_question_response`로 통일. 기본값 `"지금 생각나는 건 없어요"`.

---

## 2. 페르소나 분류체계 확립

### 2-1. 5종 정식 정의

simulator.ts에는 정의돼 있지만 코드 주석에만 존재한다. 본 문서로 정식화한다.

| 페르소나 | 🟩 코드 한 줄 | 🟦 정식 정의 (확장) | 🟦 IA의 어떤 수집 난이도를 테스트하나 |
|---|---|---|---|
| `emotional` | 감정 강함 | 분노·억울함 등 감정 서술이 답변을 지배한다. 사실(날짜·금액)은 감정 표현 사이에 흩어져 있음 | 감정 서술에서 **법적 사실을 분리·추출**하는 능력. 감정 위로에 시간을 쓰면서도 슬롯을 놓치지 않는지 |
| `fragmented` | 단답 | "네/아니요", 한 단어로만 답한다. 자발적 부연 없음 | **후속 질문 설계력**. 단답을 받았을 때 다음 슬롯으로 정확히 파고드는지. 빈약한 답을 수집됨으로 오판하지 않는지 |
| `confused` | 상황 오해/뭘 할지 모름 | 질문 의도를 오해하거나 엉뚱한 항목으로 답한다. "그게 뭐예요?"류 되물음 빈도 높음 | **재질문·명확화** 능력. 오답·되물음을 받고도 슬롯을 빈 채 넘어가지 않고 풀어내는지 |
| `avoidant` | 불리한 정보 늦게 | 자신에게 불리한 사실(예: 전입신고 미이행)을 늦게 또는 안 꺼낸다. 직접 물어야만 나옴 | **완전성·집요함**. 모든 슬롯을 끝까지 채우는지. 안 물어본 슬롯을 미수집으로 남기는지 |
| `over_explaining` | 정보 많지만 산만 | 말은 많은데 관련 없는 디테일이 섞인다. GT 슬롯이 잡음 속에 묻힘 | **잡음 속 신호 추출**. 무관한 정보에 끌려가지 않고 GT 슬롯만 정확히 집어내는지 |

### 2-2. answer_style 권장값 매핑 (🟦 신규 결정)

`_example.md`의 answer_style 3축(date/amount/emotion)을 페르소나 5종에 매핑한다. **신규 케이스 작성 시 기본값**이며, 케이스 특수성에 따라 조정 가능.

| 페르소나 | `date_precision` | `amount_precision` | `emotion_level` | 비고 |
|---|---|---|---|---|
| `emotional` | `medium` | `medium` | **`high`** | 감정 표현이 답변 길이 지배. 날짜·금액 부정확 |
| `fragmented` | **`high`** (캐물을 때만) | **`high`** (캐물을 때만) | `low` | 단답이지만 캐물으면 정확히 답함 |
| `confused` | `low` | `low` | `medium` | 질문 의도 오해. 되물음 많음 |
| `avoidant` | `high` (유리정보) / `low` (불리정보) | 동일 | `low–medium` | 불리정보만 의도적으로 모호 |
| `over_explaining` | `medium` | `medium` | `medium` | 산만한 정황 속에 GT 묻힘 |

`uncertainty_phrases` 권장 예시:

| 페르소나 | 예시 표현 |
|---|---|
| `emotional` | `"하... 그게 언제더라"` / `"기억은 잘 안 나는데..."` |
| `fragmented` | `"몰라요"` / `"기억 안 나요"` |
| `confused` | `"그게 뭐예요?"` / `"그건 잘 모르겠는데..."` |
| `avoidant` | `"음... 글쎄요"` / `"그건 좀..."` |
| `over_explaining` | `"아 그게 그러니까..."` / `"그거 말씀하시는 게..."` |

### 2-3. difficulty 매핑 (🟦 신규 결정)

**difficulty는 `hidden_info_count`(첫 발화에 안 드러나는 GT 슬롯 수, 0–16)로 결정한다.** 케이스의 법률 특이도가 아니라 **IA가 끌어내야 할 정보량**으로 난이도를 정의한다 (법률 특이도는 `issue_tags`가 담당).

| `difficulty` | `hidden_info_count` 범위 | 의미 |
|---|---|---|
| `low` | 0–6 | 첫 발화에서 절반 이상이 드러남. IA가 적게 캐물어도 됨 |
| `medium` | 7–10 | 절반 정도 숨김. 표준 난이도 |
| `medium_high` | 11–13 | 대부분 숨김. IA의 적극성 요구 |
| `high` | 14–16 | 거의 전부 숨김. 첫 발화만으로는 IA가 거의 못 채움 |

> 16슬롯 자연 분할 6/4/3/3 기준. 케이스 작성 시 GT를 먼저 채우고 `first_utterance`에서 직접 드러나는 슬롯 수를 세서 자동 결정.

### 2-4. 분포 목표 (🟦 신규 결정)

**원칙**: 케이스별 균등 분포. 실제 의뢰인 빈도 가중치 없음. 30케이스 = 5 페르소나 × 6.

#### 2-4-1. 페르소나 × difficulty 메인 그리드

| | `low` | `medium` | `medium_high` | `high` | 합계 |
|---|:-:|:-:|:-:|:-:|:-:|
| `emotional` | 1 | 2 | 2 | 1 | **6** |
| `fragmented` | 1 | 2 | 2 | 1 | **6** |
| `confused` | 1 | 2 | 2 | 1 | **6** |
| `avoidant` | 1 | 2 | 2 | 1 | **6** |
| `over_explaining` | 1 | 2 | 2 | 1 | **6** |
| **합계** | **5** | **10** | **10** | **5** | **30** |

> 페르소나당 6케이스를 `(1, 2, 2, 1)`로 분배한다. medium·medium_high에 무게를 두는 이유: 이 두 구간이 IA 변별력이 가장 큰 구간이다. low·high는 양 끝 sanity check 역할.

#### 2-4-2. 부차 분포 (전체에서 균등 확보)

메인 그리드를 1차로 박은 뒤, 다음 차원도 **전체에서 균등에 가깝게** 배분한다 (그리드를 깨지 않는 선에서).

| 차원 | enum | 목표 (30케이스 중) |
|---|---|---|
| `move_out_status` | living_in_property / moved_out / moving_out_planned / unknown | 8 / 12 / 6 / 4 |
| `notice_method` 단일 vs 다중 | 단일 채널 / 다중 채널 | 20 / 10 |
| v1 / v2 (`issue_tags` 비어있는지) | 빈 배열(v1) / 채워짐(v2) | 20 / 10 (MVP는 v1 우선) |

> 부차 차원은 hard constraint가 아니다. 메인 그리드가 우선이며, 케이스 작성 진행하며 분포 추적표(§4-3)로 모니터링.

---

## 3. 케이스 작성·검증 절차

### 3-1. 작성 단계 (5단계)

| 단계 | 작업 | 산출 |
|---|---|---|
| 1 | **GT 16슬롯 먼저 채우기.** 어떤 사건인지 구체화. `value` + `detail` | `ground_truth` |
| 2 | **페르소나 선택.** §2-4-1 그리드의 어느 칸을 채울지 결정 | `client_type`, `difficulty` |
| 3 | **first_utterance 작성.** 페르소나 어투로 1–4문장. GT 슬롯 중 몇 개를 드러낼지 의도적으로 결정 | `first_utterance` |
| 4 | **hidden_info_count 계산.** first_utterance에서 드러나지 않은 GT 슬롯 수를 카운트 → §2-3 매핑과 일치하는지 검증 | `hidden_info_count` |
| 5 | **simulator 제어값 설정.** answer_style 권장값(§2-2)을 기본으로, 케이스 특수성 반영. `proactive_speech_pool`은 정황·감정만, GT 정보 누출 없이 | `simulator` |

### 3-2. 검증 게이트 (status 승격 조건)

#### `draft → review`

| # | 게이트 | 검증 방법 |
|---|---|---|
| G1 | GT 16슬롯 완전성 | 16개 key 모두 `value` 채워짐 (선택 슬롯 없음) |
| G2 | 페르소나 enum 유효성 | `client_type` ∈ 5종 |
| G3 | difficulty ↔ hidden_info_count 일치 | §2-3 매핑 검증 |
| G4 | 첫 발화 어투 ↔ client_type 일치 | 검토자 정성 평가 (1줄 코멘트) |

#### `review → confirmed` (핵심 게이트)

| # | 게이트 | 검증 방법 |
|---|---|---|
| **G5** | **GT 누출 검사** | `proactive_speech_pool`의 모든 발화에 대해, GT 16슬롯 `value`/`detail`의 핵심 substring(날짜·금액·증거 종류명)이 포함되지 않는지 자동 검사 |
| G6 | open_question_response 통일 | 기본 `"지금 생각나는 건 없어요"` 또는 명시적 변형만 |
| G7 | 도메인 검토자 사인오프 | 사실관계 모순 없음 (예: 미퇴거 상태인데 임차권등기 신청 = 모순) |
| G8 | issue_tags 분류 정합성 | v1이면 `[]`, v2면 최소 1개 태그 |

> 🟦 **G5(누출 검사)는 스크립트화 필요.** `eval/golden-set/scripts/validate_leakage.ts`(가칭)로 CI에 거는 것을 권장. v1 출시 전 필수.

#### 폐기 / 강등

- `confirmed` 케이스도 GT 수정·페르소나 부조화 발견 시 `review` 또는 `draft`로 강등 가능. status는 역방향 허용.
- 폐기 케이스는 파일을 삭제하지 말고 `_deprecated/` 하위로 이동하거나 `status: deprecated` enum 추가 (🟦 결정 필요, §5).

---

## 4. 기존 케이스 보완 계획

### 4-1. 현황 (2026-06-28 기준)

| case_id | frontmatter | status | 페르소나 / difficulty | 메모 |
|---|---|---|---|---|
| `_example.md` | 템플릿 | — | — | 참조용 |
| IA-CASE-001 | 비어있음 | — | TBD | 신규 작성 또는 v2 케이스 |
| IA-CASE-002 | v1 채워짐 | `draft` | `emotional` / `low` | 그리드 left-top 채움 |
| IA-CASE-003 | 비어있음 | — | TBD | 신규 |
| IA-CASE-004 | 비어있음 | — | TBD | 신규 |
| IA-CASE-005 | 비어있음 | — | TBD | 신규 |
| IA-CASE-006 | 비어있음 | — | TBD | 신규 |
| IA-CASE-007 | v1 채워짐 | `draft` | (frontmatter 재확인 필요) | |
| IA-CASE-008 | v1 채워짐 | `draft` | (frontmatter 재확인 필요) | |

> 이미 채워진 002/007/008도 본 분류체계 기준으로 재검증 필요 (difficulty ↔ hidden_info_count 일치, answer_style 매핑 확인 등).

### 4-2. 작업 목록

| 우선순위 | 작업 | 담당 | 산출 |
|---|---|---|---|
| **P0** | G5 누출 검사 스크립트 작성 | 유진 | `eval/golden-set/scripts/validate_leakage.ts` |
| **P0** | 기존 v1 3개(002/007/008) 본 스펙 기준 재검증 | 유진 | status `draft → review` 승격 |
| **P1** | 007/008 그리드 위치 확정 → §4-3 표 업데이트 | 유진 | 분포 추적표 갱신 |
| **P1** | 빈 케이스 5개(001/003–006) frontmatter 채우기 | 유진 | 5케이스 추가 |
| **P1** | 그리드 빈 칸 우선 메우기 (§2-4-1 기준) | 유진 | — |
| **P2** | 신규 17케이스 작성 (8 → 30) | 유진 (+ 검토자) | 17케이스 |
| **P2** | 도메인 검토자 사인오프 (G7) | 외부 검토자 | `confirmed` 승격 |

### 4-3. 분포 추적 — 현재 채워진 케이스의 그리드 위치

| | `low` | `medium` | `medium_high` | `high` |
|---|---|---|---|---|
| `emotional` | **002** ⬜ | ⬜ ⬜ | ⬜ ⬜ | ⬜ |
| `fragmented` | ⬜ | ⬜ ⬜ | ⬜ ⬜ | ⬜ |
| `confused` | ⬜ | ⬜ ⬜ | ⬜ ⬜ | ⬜ |
| `avoidant` | ⬜ | ⬜ ⬜ | ⬜ ⬜ | ⬜ |
| `over_explaining` | ⬜ | ⬜ ⬜ | ⬜ ⬜ | ⬜ |

> 002만 확인됨 (`emotional × low`). 007·008은 frontmatter 재확인 후 위치 표시. 빈 슬롯부터 우선 작성.

---

## 5. 결정 추적

| 항목 | 결정 | 출처 |
|---|---|---|
| frontmatter SSOT | frontmatter만 평가, 본문은 인간용 | 🟩 코드 |
| 페르소나 5종 enum | emotional / fragmented / confused / avoidant / over_explaining | 🟩 코드 |
| difficulty enum | low / medium / medium_high / high (4단계) | 🟩 `_example.md` |
| difficulty 매핑 기준 | `hidden_info_count` | 🟦 본 문서 |
| difficulty 매핑 구간 | 0–6 / 7–10 / 11–13 / 14–16 | 🟦 본 문서 |
| 분포 방식 | 케이스별 균등. 5 × 6 = 30 | 🟦 본 문서 |
| 페르소나 내 difficulty 분배 | (low, medium, medium_high, high) = (1, 2, 2, 1) | 🟦 본 문서 |
| 검증 게이트 G5 (누출 검사) | substring 자동 검사 (스크립트화 필요) | 🟦 본 문서 |

### 미결 / 추가 결정 필요

- ⏸ `evaluation_purpose` enum 확정 (현재 `_example.md`에는 3개만 예시)
- ⏸ `risk_missing_points` 항목명이 슬롯 key 기반인지 별도 enum인지 (002에서는 슬롯 key가 아닌 표현 사용 — `registry_not_checked`, `leasehold_registration` 등)
- ⏸ G5 누출 검사 스크립트 매칭 방식 (substring 단순 매칭 / 토큰 기반 / 임베딩 유사도)
- ⏸ 폐기 status enum (`deprecated` 추가 여부)
- ⏸ `issue_tags` 표준 어휘집 (v2 작성 전 확정 필요)

---
