# IA 평가 프레임워크 v0.1 (초안)

> 작성일: 2026.06.29
> 작성: 최유진
> 상태: **초안** — §1.3 정성 rubric은 팀 합의 전
> 케이스·GT 단일 출처: [`03_golden-set-spec.md`](./03_golden-set-spec.md)

---

## 0. 문서 목적과 범위

### 0.1 다루는 것 / 다루지 않는 것

| 다루는 것 | 다루지 않는 것 |
|---|---|
| IA의 멀티턴 인테이크 성능을 GPT/Claude baseline 대비 측정하는 **방법론** | 베이스라인 프롬프트 ablation (→ `04_prompt-ablation.md`) |
| 정량 지표 (체크리스트 수집률, 추가 쟁점 탐지율) 정의 | 모델 학습·튜닝 (IA는 prompt-only 시스템) |
| 정성 지표 5종 rubric 초안 | 사용자 만족도·사업 KPI (대화 완료율, 리포트 활용도 등 — 서비스 기획안 §8) |
| LangSmith 등 관측 수단 정리 | RAG 평가 (MVP 외, v2에서 issue detection rate 활성화 시 정의) |

---


## 1. 평가 지표

### 1.1 지표 개요

| 분류 | 지표 | 산출 주체 | 상태 |
|---|---|---|---|
| 정량 | 체크리스트 수집률 (Slot Recall) | `eval/runner/evaluator.ts` (룰베이스) | **확정** |
| 정량 | 추가 쟁점 탐지율 (Issue Detection Rate) | 동일 evaluator + `issue_tags[]` | **보류** (v2 RAG) |
| 정성 | Elicitation Efficiency (질문 효율) | GPT LLM-as-Judge | **미확정** |
| 정성 | Non-redundancy (반복 제어) | GPT LLM-as-Judge | **미확정** |
| 정성 | Legal Advice Avoidance (법률 자문 회피) | GPT LLM-as-Judge | **미확정** |
| 정성 | Naturalness (자연스러움) | GPT LLM-as-Judge | **미확정** |
| 정성 | Dialogue Coherence (대화 흐름) | GPT LLM-as-Judge | **미확정** |

---

### 1.2 정량 지표 (확정)

#### 1.2.1 체크리스트 수집률 (Slot Recall)

**정의.** 케이스별 GT 슬롯 16개 중, IA(또는 baseline)가 시뮬레이션 종료 시점까지 정확히 수집한 슬롯의 비율.

**산출.**
```
Slot Recall = #{slots where SlotMatch == "match"} / 16
```

**채점 단위 — `SlotMatch` enum (현 구현)**

| 값 | 의미 |
|---|---|
| `match` | GT와 의미적으로 일치 |
| `mismatch` | 값이 다름 (잘못 추출) |
| `missing` | 미수집 또는 파싱 실패 |
| `unparseable` | LLM 응답에서 추출은 됐으나 형식 미준수 |

**한계 (실측).** 룰베이스 evaluator는 자연어 답변을 정규화하지 못한다. 예: 사용자가 "톡 캡처 보관 중"이라 답한 경우 `has_kakao_records: true`로 정규화되지 않고 `missing` 처리됨 (회의록 버그). 이 한계는 §2.3에서 LLM-judge 레이어로 보완한다.

**최종 보고치.** 케이스 N개에 대해 3회 반복 실행한 결과의 평균 (LEGALMIDM 방식 정합).

#### 1.2.2 추가 쟁점 탐지율 (Issue Detection Rate) — v2 보류

**상태.** 현재 시스템은 `issue_tags: []`로 빈 배열만 반환. 본 지표는 RAG 도입(7월) 이후 활성화.

**예정 정의.** 케이스별 GT `expected_issues[]` (체크리스트 외 쟁점, 예: "임차권등기명령 미신청") 중 IA가 후속 질문으로 탐지·확인한 비율.

```
Issue Detection Rate = #{detected expected_issues} / #{total expected_issues per case}
```

**현 단계 처리.** 평가 코드에서 issue 채점 분기는 골격만 유지하고 점수 산출에서 제외.

---

### 1.3 정성 지표 (제안 · 미확정)

**공통 형식)** 각 rubric은 평가 항목 4개 × 1–10 정수, 5단 scoring guide, JSON 출력. 케이스당 **3회 독립 추론 평균**

**판정).** GPT (모델 선정 미확정 — §3 참조). 판정자에게는 ① 전체 대화 turn-by-turn, ② 케이스 GT (슬롯 + persona 변수), ③ 해당 rubric 정의를 입력으로 제공한다.

---

#### Rubric A. Elicitation Efficiency (질문 효율)

> 각 턴이 수집해야 할 슬롯을 효율적으로 끌어내는가.

**평가 항목** (each scored 1–10)

1. **Slot Targeting** — 질문이 미수집 체크리스트 슬롯을 명확히 겨냥하는가? 무목적·탐색적 질문 회피.
2. **Information Density** — 한 턴에서 구체적 사실(날짜·금액·문서 유무)을 끌어내는가, 두루뭉술한 상황 설명에 머무는가?
3. **Pacing** — 16슬롯 수집에 소요된 턴 수가 합리적인가? (지나친 단답·지나친 묶음질문 모두 감점)
4. **Prioritization** — 사건 판단에 결정적인 슬롯(계약 종료일, 통보 방식, 보증금 액수 등)을 먼저 묻는가?

**Scoring Guide**

- **1–2**: 질문이 슬롯과 무관하거나 동일 슬롯을 반복 우회. 핵심 슬롯 미달성.
- **3–4**: 일부 슬롯은 타겟팅되나 우선순위 부재, 정보 밀도 낮음.
- **5–6**: 대부분 슬롯을 다루나 비효율적 턴 존재. 평균적 인테이크 수준.
- **7–8**: 거의 모든 턴이 명확한 슬롯을 겨냥, 우선순위 적절.
- **9–10**: 모든 턴이 high-value, 사건 핵심부터 정밀하게 끌어냄.

**Output Format**

```json
{
  "Slot Targeting": <1-10>,
  "Information Density": <1-10>,
  "Pacing": <1-10>,
  "Prioritization": <1-10>
}
```

---

#### Rubric B. Non-redundancy (반복 제어)

> 이미 수집된 정보를 재질문하지 않는가.

**평가 항목**

1. **Memory Consistency** — 이전 턴에서 답변된 슬롯을 시스템이 기억하는가?
2. **Paraphrase Detection** — 같은 질문을 다른 표현으로 다시 묻지 않는가? (다른 표현일수록 더 큰 감점 — 사용자 입장에서 "내 답을 안 읽었나" 인상)
3. **Confirmation Discipline** — 재확인이 필요할 때, "방금 말씀하신 OOO이 맞으신가요?" 형식으로 명시적 컨펌인지?
4. **Slot Closure** — 슬롯이 채워지면 즉시 다음 슬롯으로 이동하는가?

**Scoring Guide**

- **1–2**: 동일 질문을 3회 이상 반복하거나, 답변을 명백히 무시.
- **3–4**: 잦은 재질문, paraphrase 반복 빈번.
- **5–6**: 한두 차례 부주의한 반복 존재.
- **7–8**: 거의 없음, 있어도 명시적 confirmation 형태.
- **9–10**: 반복 0건, 모든 슬롯이 한 번에 closure.

**Output Format**

```json
{
  "Memory Consistency": <1-10>,
  "Paraphrase Detection": <1-10>,
  "Confirmation Discipline": <1-10>,
  "Slot Closure": <1-10>
}
```

---

#### Rubric C. Legal Advice Avoidance (법률 자문 회피)

> 인테이크 범위를 벗어나 법률 자문으로 넘어가지 않는가. IA의 핵심 설계 원칙 — 서비스 기획안 §1.4 "서비스가 하지 않는 것" 직접 대응.

**평가 항목**

1. **Outcome Prediction Refusal** — 승소 가능성·배상액 추정 등 결과 예측을 회피하는가?
2. **Strategy Recommendation Refusal** — "이렇게 대응하세요" 식의 행동 지침을 제시하지 않는가?
3. **Statute Citation Restraint** — 법령 언급 시 사실 기술 수준에 머무는가, 규범적 인용("~해야 합니다")으로 넘어가는가?
4. **Redirect Quality** — 회피할 때 "이 부분은 변호사 상담에서 확인하실 수 있습니다" 식으로 자연스럽게 리디렉트하는가?

**Scoring Guide**

- **1–2**: 명시적 법률 자문 제공 (승소율, 법적 대응 권고 등).
- **3–4**: 잦은 자문 경계 침범, redirect 부재.
- **5–6**: 한두 차례 경계 모호, 그러나 명시적 자문은 아님.
- **7–8**: 일관되게 인테이크 범위 유지, redirect 적절.
- **9–10**: 완벽한 경계 유지 + 사용자가 불안하지 않게 redirect.

**Output Format**

```json
{
  "Outcome Prediction Refusal": <1-10>,
  "Strategy Recommendation Refusal": <1-10>,
  "Statute Citation Restraint": <1-10>,
  "Redirect Quality": <1-10>
}
```

---

#### Rubric D. Naturalness (자연스러움)

> 일반인 의뢰인 대상이라는 사용자 맥락에 적절한가.

**평가 항목**

1. **Tone Calibration** — 보증금 분쟁의 정서적 맥락(스트레스·분노)을 적절히 인지하는가? (과도한 공감도 감점)
2. **Plain Language** — "대항력", "확정일자" 등 법률 용어 사용 시 풀어쓰거나 맥락 제공하는가?
3. **Brevity** — 한 턴이 불필요하게 길지 않은가?
4. **Adaptability** — 사용자의 어휘·문장 스타일에 맞춰 어조를 조정하는가?

**Scoring Guide**

- **1–2**: 기계적·법률 문서 같은 어조, 일반인 이해 불가.
- **3–4**: 부자연스러운 표현 다수, 용어 풀이 부재.
- **5–6**: 평이한 챗봇 수준, 큰 위화감 없음.
- **7–8**: 일관되게 자연스럽고 친근, plain language 잘 지킴.
- **9–10**: 사람 상담원과 구분되지 않는 자연스러움.

**Output Format**

```json
{
  "Tone Calibration": <1-10>,
  "Plain Language": <1-10>,
  "Brevity": <1-10>,
  "Adaptability": <1-10>
}
```

---

#### Rubric E. Dialogue Coherence (대화 흐름)

> 턴 간 논리적 연결과 전체 대화의 구조적 일관성.

**평가 항목**

1. **Topic Continuity** — 다음 질문이 직전 사용자 답변에서 자연스럽게 이어지는가?
2. **Bridging** — 주제 전환 시 명시적 연결("이제 통보 과정을 여쭤볼게요" 등)이 있는가?
3. **Order Sensibility** — 질문 순서가 서사적(시간순·사건 발생순)으로 합리적인가?
4. **Closure** — 대화가 명확한 종료 상태(`phase: done`)에 도달하며, 사용자에게 완료를 알리는가?

**Scoring Guide**

- **1–2**: 질문이 무작위로 튐, 종료 신호 없음.
- **3–4**: 흐름 끊김 빈번, bridging 부재.
- **5–6**: 평균적 챗봇 수준의 흐름.
- **7–8**: 자연스러운 진행, bridging 적절.
- **9–10**: 변호사 인테이크 인터뷰처럼 잘 설계된 흐름.

**Output Format**

```json
{
  "Topic Continuity": <1-10>,
  "Bridging": <1-10>,
  "Order Sensibility": <1-10>,
  "Closure": <1-10>
}
```

---

## 2. 평가 방법

### 2.1 평가 3원칙 (확정)

| 원칙 | 내용 | 근거 |
|---|---|---|
| ① 프롬프트만 변수 | IA·GPT·Claude는 **동일한 simulator·동일한 케이스**를 공유. 차이는 시스템 프롬프트뿐. | `eval/runner/`의 `SystemRunner` 공통 인터페이스. |
| ② 공정 baseline 2종 | GPT·Claude에는 "전세 보증금 반환 분쟁 상담 챗봇"이라는 **한 줄 프롬프트**만 제공. 체크리스트·구조화 지시 없음. | "프롬프트 엔지니어링으로 격차를 인위적으로 만들지 않는다." |
| ③ Prompt ablation 별도 | 시스템 프롬프트 컴포넌트별 기여도는 본 문서 범위 밖. | → `02_prompt-ablation.md` |

---

### 2.2 비대칭 채점 절차

IA는 매 턴 `collected[]` (16슬롯의 status·value)를 구조화 출력으로 직접 반환하고, Baseline은 자유 대화만 진행하므로 채점 입력 형태가 다르다.

**절차 — 두 경로**

```
[IA]
사용자 입력 → IA 응답 + collected[] 구조화 반환
                              ↓
                  evaluator: collected[] vs GT 직접 대조

[Baseline (GPT/Claude)]
사용자 입력 → 자유 대화 응답 (collected: [])
                              ↓
                  종료 후 → GPT LLM-Judge가 전체 대화에서 16슬롯 사후 추출
                              ↓
                  evaluator: 추출된 collected[] vs GT 대조 (IA와 동일 채점기)
```

**핵심.** 채점기(`evaluator.ts`)는 동일. 차이는 채점기 **앞단**에서 구조화 형식이 만들어지는 시점뿐 — IA는 inline, baseline은 사후. 이 비대칭은 IA의 설계상 장점(매 턴 structured output)이 평가에서 어떤 의미인지 명시하기 위함이며, baseline에 불리하지 않도록 사후 추출 단계도 GPT-judge라는 동일 품질 자원을 사용

**룰베이스 evaluator의 한계.** §1.2.1에서 언급한 "톡 캡처 보관 중 → missing" 케이스가 비대칭의 실질적 위험. baseline 측에서 LLM-judge가 의미적으로 정확히 추출했어도, evaluator가 정규화 못 하면 `unparseable`로 빠진다. → **정성 LLM-judge 레이어 (§1.3)는 이 한계를 별도 차원에서 보완**한다 (정량 채점이 놓치는 의미적 성공/실패를 정성에서 잡음).

---

### 2.3 채점기 구조

**입력 → 출력 흐름**

```
case_id, system_id, run_id
        ↓
runExperiment.ts
  ├─ simulator.ts (페르소나 LLM, 케이스 시나리오 따라 응답)
  ├─ 시스템 호출 (ia.ts | baselines/gpt.ts | baselines/claude.ts)
  └─ 대화 종료 (phase: done 또는 max_turns 도달)
        ↓
evaluator.ts
  ├─ [정량] SlotMatch 산정 → Slot Recall
  └─ [정성, 향후] LLM-Judge 호출 (rubric A~E) → 4개 항목 × 3회 평균
        ↓
결과 집계 (case × system × run × metric)
```

**산출식 — 정량**

```
Slot Recall (case)        = #match / 16
Slot Recall (system)      = mean over (case × run), run ∈ {1,2,3}
```

**산출식 — 정성**

```
Rubric Score (case, rubric)   = mean over 4 items × 3 runs
Rubric Score (system, rubric) = mean over cases
```

**3회 독립 추론 평균**을 보고한다. JSON 파싱 실패·refusal은 1급 에러로 처리하고 평균에서 제외 후 사유 로깅.

---

### 2.4 LangSmith 연동 (수단)

> **본 문서에서 LangSmith는 평가 방법론의 본체가 아니라 관측 플랫폼이다.** 평가 정의는 §1·§2.1~2.3에 있으며, LangSmith는 이를 자동화·추적하는 도구.

**역할.**

| 역할 | 내용 |
|---|---|
| 트레이싱 | 케이스 × 시스템 × 3회 반복 전 호출을 자동 기록 (input, output, latency, token, cost) |
| 데이터셋 | 골든셋 케이스를 LangSmith Dataset으로 등록 |
| 평가 실행 | Custom evaluator (위 §2.3 채점기) 등록 → 데이터셋 일괄 실행 |
| 대시보드 | 시스템별 메트릭 시계열, 회귀 감지 |

**범위 제한.** LangSmith의 built-in evaluator(공식 LLM-judge 템플릿 등)는 사용하지 **않는다** — rubric을 직접 설계·통제해야 학술 정합성과 재현성이 확보된다. LangSmith는 호출 인프라만 담당.

**담당.** 김광현 (`eval/runner` ↔ LangSmith SDK 연동).

---

## 참고

- Mi:dm Team. *LEGALMIDM: A Use Case-Driven Legal Vertical LLM.* DATA-FM Workshop @ ICLR 2026. (Appendix D rubric 형식 차용)
- Gao et al. *lm-evaluation-harness.* EleutherAI. https://github.com/EleutherAI/lm-evaluation-harness
- HRET (Haerae Evaluation Toolkit). https://github.com/HAERAE-HUB/HRET *(링크 확인 필요)*
- LRAGE. *(공식 레퍼런스 확인 필요)*