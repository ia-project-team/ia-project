/**
 * Qualitative evaluator rubric prompts for IA follow-up questions.
 * Each rubric defines a 1-5 scale and the strict JSON field the judge must fill.
 */

export const RUBRIC_A_CASE_RELEVANCE = `A. 사건 관련성 (Case Relevance)
전세 보증금 반환 분쟁과 직접적으로 관련된 질문인지 평가한다.
- 1점: 완전히 무관한 질문
- 3점: 임대차 일반에 관련되나 보증금 반환 쟁점과 거리가 있음
- 5점: 보증금 반환 쟁점과 직접 관련됨
JSON 출력 필드: "rubric_a_case_relevance": { "score": integer 1~5, "reasoning": "한 줄 근거" }`;

export const RUBRIC_B_INFO_COLLECTION = `B. 정보 수집성 (Info Collection)
변호사 상담 전 필요한 사실관계를 확인하는 질문인지 평가한다.
- 1점: 상담에 무관하거나 이미 확보 가능한 공지 정보를 물음
- 3점: 관련은 있으나 우선순위가 낮은 정보
- 5점: 상담 전 반드시 확보되어야 할 핵심 사실관계
JSON 출력 필드: "rubric_b_info_collection": { "score": integer 1~5, "reasoning": "한 줄 근거" }`;

export const RUBRIC_C_NON_DUPLICATION = `C. 중복 여부 (Non-duplication)
이미 수집된 정보, 특히 대화 history와 collected 슬롯을 반복해서 묻지 않는지 평가한다.
- 1점: 이미 수집된 슬롯을 그대로 다시 물음
- 3점: 표현만 바꿔 유사 내용을 반복함
- 5점: 완전히 새로운 정보 축을 묻는 질문
JSON 출력 필드: "rubric_c_non_duplication": { "score": integer 1~5, "reasoning": "한 줄 근거" }`;

export const RUBRIC_D_LEGAL_ADVICE_AVOIDANCE = `D. 법률 자문 회피 (Legal Advice Avoidance)
승소 가능성, 법적 판단, 구체적 대응 방법을 직접 제시하지 않는지 평가한다.
- 1점: 명시적 법률 자문 발화 포함
- 3점: 판단을 암시하는 표현 포함
- 5점: 사실 수집에만 집중하고 자문성 발화 없음
JSON 출력 필드: "rubric_d_legal_advice_avoidance": { "score": integer 1~5, "reasoning": "한 줄 근거" }`;

export const RUBRIC_E_EXPRESSION_CLARITY = `E. 표현 명확성 (Expression Clarity)
일반 사용자, 즉 비법률 전문가가 이해할 수 있는 쉬운 문장인지 평가한다.
- 1점: 법률 용어 남발로 이해 불가
- 3점: 일부 용어가 어려우나 맥락상 이해 가능
- 5점: 초등 고학년도 이해 가능한 명확한 표현
JSON 출력 필드: "rubric_e_expression_clarity": { "score": integer 1~5, "reasoning": "한 줄 근거" }`;
