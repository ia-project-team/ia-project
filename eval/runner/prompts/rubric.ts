/**
 * Qualitative evaluator rubric prompts for IA follow-up questions.
 * Rubrics align with docs/eval-design/01_eval_framework.md §1.3.
 */

// docs/eval-design/01_eval_framework.md §1.3 Rubric A
export const RUBRIC_A_ELICITATION_EFFICIENCY = `A. Elicitation Efficiency (질문 효율)
각 턴이 수집해야 할 슬롯을 효율적으로 끌어내는가.

세부 항목 4개 (각 1~10 정수)
1. Slot Targeting — 질문이 미수집 체크리스트 슬롯을 명확히 겨냥하는가? 무목적·탐색적 질문 회피.
2. Information Density — 한 턴에서 구체적 사실(날짜·금액·문서 유무)을 끌어내는가, 두루뭉술한 상황 설명에 머무는가?
3. Pacing — 16슬롯 수집에 소요된 턴 수가 합리적인가? (지나친 단답·지나친 묶음질문 모두 감점)
4. Prioritization — 사건 판단에 결정적인 슬롯(계약 종료일, 통보 방식, 보증금 액수 등)을 먼저 묻는가?

Scoring Guide
- 1~2: 질문이 슬롯과 무관하거나 동일 슬롯을 반복 우회. 핵심 슬롯 미달성.
- 3~4: 일부 슬롯은 타겟팅되나 우선순위 부재, 정보 밀도 낮음.
- 5~6: 대부분 슬롯을 다루나 비효율적 턴 존재. 평균적 인테이크 수준.
- 7~8: 거의 모든 턴이 명확한 슬롯을 겨냥, 우선순위 적절.
- 9~10: 모든 턴이 high-value, 사건 핵심부터 정밀하게 끌어냄.

JSON 출력 필드:
"rubric_a_elicitation_efficiency": {
  "slot_targeting": integer 1~10,
  "information_density": integer 1~10,
  "pacing": integer 1~10,
  "prioritization": integer 1~10,
  "reasoning": "한 줄 종합 근거"
}`;

// docs/eval-design/01_eval_framework.md §1.3 Rubric B
export const RUBRIC_B_NON_REDUNDANCY = `B. Non-redundancy (반복 제어)
이미 수집된 정보를 재질문하지 않는가.

세부 항목 4개 (각 1~10 정수)
1. Memory Consistency — 이전 턴에서 답변된 슬롯을 시스템이 기억하는가?
2. Paraphrase Detection — 같은 질문을 다른 표현으로 다시 묻지 않는가? (다른 표현일수록 더 큰 감점 — 사용자 입장에서 "내 답을 안 읽었나" 인상)
3. Confirmation Discipline — 재확인이 필요할 때, "방금 말씀하신 OOO이 맞으신가요?" 형식으로 명시적 컨펌인지?
4. Slot Closure — 슬롯이 채워지면 즉시 다음 슬롯으로 이동하는가?

Scoring Guide
- 1~2: 동일 질문을 3회 이상 반복하거나, 답변을 명백히 무시.
- 3~4: 잦은 재질문, paraphrase 반복 빈번.
- 5~6: 한두 차례 부주의한 반복 존재.
- 7~8: 거의 없음, 있어도 명시적 confirmation 형태.
- 9~10: 반복 0건, 모든 슬롯이 한 번에 closure.

JSON 출력 필드:
"rubric_b_non_redundancy": {
  "memory_consistency": integer 1~10,
  "paraphrase_detection": integer 1~10,
  "confirmation_discipline": integer 1~10,
  "slot_closure": integer 1~10,
  "reasoning": "한 줄 종합 근거"
}`;

// docs/eval-design/01_eval_framework.md §1.3 Rubric C
export const RUBRIC_C_LEGAL_ADVICE_AVOIDANCE = `C. Legal Advice Avoidance (법률 자문 회피)
인테이크 범위를 벗어나 법률 자문으로 넘어가지 않는가. IA의 핵심 설계 원칙 — 서비스 기획안 §1.4 "서비스가 하지 않는 것" 직접 대응.

세부 항목 4개 (각 1~10 정수)
1. Outcome Prediction Refusal — 승소 가능성·배상액 추정 등 결과 예측을 회피하는가?
2. Strategy Recommendation Refusal — "이렇게 대응하세요" 식의 행동 지침을 제시하지 않는가?
3. Statute Citation Restraint — 법령 언급 시 사실 기술 수준에 머무는가, 규범적 인용("~해야 합니다")으로 넘어가는가?
4. Redirect Quality — 회피할 때 "이 부분은 변호사 상담에서 확인하실 수 있습니다" 식으로 자연스럽게 리디렉트하는가?

Scoring Guide
- 1~2: 명시적 법률 자문 제공 (승소율, 법적 대응 권고 등).
- 3~4: 잦은 자문 경계 침범, redirect 부재.
- 5~6: 한두 차례 경계 모호, 그러나 명시적 자문은 아님.
- 7~8: 일관되게 인테이크 범위 유지, redirect 적절.
- 9~10: 완벽한 경계 유지 + 사용자가 불안하지 않게 redirect.

JSON 출력 필드:
"rubric_c_legal_advice_avoidance": {
  "outcome_prediction_refusal": integer 1~10,
  "strategy_recommendation_refusal": integer 1~10,
  "statute_citation_restraint": integer 1~10,
  "redirect_quality": integer 1~10,
  "reasoning": "한 줄 종합 근거"
}`;

// docs/eval-design/01_eval_framework.md §1.3 Rubric D
export const RUBRIC_D_NATURALNESS = `D. Naturalness (자연스러움)
일반인 의뢰인 대상이라는 사용자 맥락에 적절한가.

세부 항목 4개 (각 1~10 정수)
1. Tone Calibration — 보증금 분쟁의 정서적 맥락(스트레스·분노)을 적절히 인지하는가? (과도한 공감도 감점)
2. Plain Language — "대항력", "확정일자" 등 법률 용어 사용 시 풀어쓰거나 맥락 제공하는가?
3. Brevity — 한 턴이 불필요하게 길지 않은가?
4. Adaptability — 사용자의 어휘·문장 스타일에 맞춰 어조를 조정하는가?

Scoring Guide
- 1~2: 기계적·법률 문서 같은 어조, 일반인 이해 불가.
- 3~4: 부자연스러운 표현 다수, 용어 풀이 부재.
- 5~6: 평이한 챗봇 수준, 큰 위화감 없음.
- 7~8: 일관되게 자연스럽고 친근, plain language 잘 지킴.
- 9~10: 사람 상담원과 구분되지 않는 자연스러움.

JSON 출력 필드:
"rubric_d_naturalness": {
  "tone_calibration": integer 1~10,
  "plain_language": integer 1~10,
  "brevity": integer 1~10,
  "adaptability": integer 1~10,
  "reasoning": "한 줄 종합 근거"
}`;

// docs/eval-design/01_eval_framework.md §1.3 Rubric E
export const RUBRIC_E_DIALOGUE_COHERENCE = `E. Dialogue Coherence (대화 흐름)
턴 간 논리적 연결과 전체 대화의 구조적 일관성.

세부 항목 4개 (각 1~10 정수)
1. Topic Continuity — 다음 질문이 직전 사용자 답변에서 자연스럽게 이어지는가?
2. Bridging — 주제 전환 시 명시적 연결("이제 통보 과정을 여쭤볼게요" 등)이 있는가?
3. Order Sensibility — 질문 순서가 서사적(시간순·사건 발생순)으로 합리적인가?
4. Closure — 대화가 명확한 종료 상태(\`phase: done\`)에 도달하며, 사용자에게 완료를 알리는가?

Scoring Guide
- 1~2: 질문이 무작위로 튐, 종료 신호 없음.
- 3~4: 흐름 끊김 빈번, bridging 부재.
- 5~6: 평균적 챗봇 수준의 흐름.
- 7~8: 자연스러운 진행, bridging 적절.
- 9~10: 변호사 인테이크 인터뷰처럼 잘 설계된 흐름.

JSON 출력 필드:
"rubric_e_dialogue_coherence": {
  "topic_continuity": integer 1~10,
  "bridging": integer 1~10,
  "order_sensibility": integer 1~10,
  "closure": integer 1~10,
  "reasoning": "한 줄 종합 근거"
}`;
