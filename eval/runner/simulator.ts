/**
 * Client Simulator - Ground Truth 기반 의뢰인 시뮬레이션
 *
 * 직전 결정 사항:
 *  - 엄격 + 범위 좁힘 규칙
 *  - GT 16개 슬롯 정보는 자발 발화 절대 금지
 *  - GT 외 정황/감정/맥락은 proactive_speech_pool 안에서 허용
 *  - open question 시 정해진 응답으로 통일
 *
 * 모델: process.env.OPENAI_SIMULATOR_MODEL (기본값 "gpt-5-mini")
 * 정확한 모델 ID는 .env 또는 .env.local 에서 조정.
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

// ============================================================
// Types
// ============================================================

export interface Persona {
  name: string;
  age: number;
  occupation: string;
  residence_history: string;
  current_situation: string;
}

export interface AnswerStyle {
  date_precision: "high" | "medium" | "low";
  amount_precision: "high" | "medium" | "low";
  emotion_level: "low" | "medium" | "high";
  uncertainty_phrases: string[];
}

export interface SimulatorConfig {
  answer_style: AnswerStyle;
  proactive_speech_pool: string[];
  open_question_response: string;
}

export interface GTValue {
  value: unknown;
  unit?: string;
  detail?: string;
}

export interface GoldenSetCase {
  case_id: string;
  case_title: string;
  client_type: string;
  difficulty: string;
  persona: Persona;
  first_utterance: string;
  ground_truth: Record<string, GTValue>;
  simulator: SimulatorConfig;
  evaluation_purpose?: string[];
  issue_tags?: string[];
  risk_missing_points?: string[];
  expected_ia_turns?: number;
}

export interface SimulatorTurn {
  role: "client" | "ai";
  content: string;
}

// ============================================================
// Case Loader - frontmatter md 파일 파싱
// ============================================================

/**
 * 단일 케이스 md 파일을 읽어 frontmatter 부분만 파싱.
 * 본문은 인간 검토용이므로 평가 자동화에서 무시.
 */
export function loadCase(casePath: string): GoldenSetCase | null {
  const fileContent = fs.readFileSync(casePath, "utf-8");
  if (!fileContent.trim()) return null; // 빈 파일 스킵
  const { data } = matter(fileContent);
  if (!data.case_id) return null; // case_id 없으면 무효
  return data as GoldenSetCase;
}

/**
 * cases 디렉토리에서 모든 유효한 케이스 로드.
 * 빈 파일과 case_id 없는 파일은 자동 스킵.
 *
 * @param casesDir - 케이스 파일들이 있는 디렉토리 (예: eval/golden-set/cases)
 * @param caseIds - 선택적 필터링 (특정 case_id만 로드, 미지정 시 전부)
 */
export function loadCasesFromDir(
  casesDir: string,
  caseIds?: string[]
): GoldenSetCase[] {
  const files = fs.readdirSync(casesDir).filter((f) => f.endsWith(".md"));
  const cases = files
    .map((f) => loadCase(path.join(casesDir, f)))
    .filter((c): c is GoldenSetCase => c !== null)
    .filter((c) => !caseIds || caseIds.includes(c.case_id));
  return cases;
}

// ============================================================
// Simulator System Prompt Builder
// ============================================================

function buildSimulatorSystemPrompt(c: GoldenSetCase): string {
  const gtString = JSON.stringify(c.ground_truth, null, 2);

  const proactivePool =
    c.simulator.proactive_speech_pool.length > 0
      ? c.simulator.proactive_speech_pool.map((p) => `- "${p}"`).join("\n")
      : "- (없음)";

  const uncertaintyPhrases =
    c.simulator.answer_style.uncertainty_phrases.length > 0
      ? c.simulator.answer_style.uncertainty_phrases
          .map((p) => `- "${p}"`)
          .join("\n")
      : "- (없음)";

  return `당신은 임대차 분쟁 의뢰인 역할을 합니다.

## 페르소나
- 이름: ${c.persona.name}
- 나이: ${c.persona.age}세
- 직업: ${c.persona.occupation}
- 거주 이력: ${c.persona.residence_history}
- 현재 상황: ${c.persona.current_situation}

## 의뢰인 유형
${c.client_type}
참고:
- emotional: 억울함/불안/분노 등 감정 표현 강함
- fragmented: 알고 있는 사실만 짧게 단답
- confused: 상황을 잘못 이해하거나 무엇을 해야 할지 모름
- avoidant: 불리하거나 중요한 정보를 늦게 말함
- over_explaining: 정보는 많지만 구조화되지 않고 산만함

## 답변 스타일
- 날짜 정확도: ${c.simulator.answer_style.date_precision}
- 금액 정확도: ${c.simulator.answer_style.amount_precision}
- 감정 표현 강도: ${c.simulator.answer_style.emotion_level}
- 불확실성 표현 (선택적으로 섞기):
${uncertaintyPhrases}

## 당신이 알고 있는 사실 (Ground Truth)
다음 JSON 이 당신이 실제로 알고 있는 사실관계의 전체입니다.
이 정보는 절대 외부에 노출되지 않도록 하고, 질문받았을 때만 풀어서 답하세요.

\`\`\`json
${gtString}
\`\`\`

## 답변 규칙 (엄격하게 따르세요)

1. GT 에 있는 정보는 정확히 답하세요.
   - 질문이 GT 슬롯과 매칭되면, 그 value 를 답에 포함하세요.
   - detail 필드가 있으면 그 정황을 참고해서 자연스럽게 풀어 말하세요.

2. GT 에 없는 사실은 절대 지어내지 마세요.
   - 모르는 정보는 "잘 모르겠어요" 또는 "기억이 안 나요" 로 답하세요.

3. 자발 발화 금지 (가장 중요)
   - AI 가 묻지 않은 GT 슬롯 정보는 절대 먼저 말하지 마세요.
   - 예: AI 가 "계약서 있나요" 라고 묻기 전에는 계약 시작일을 먼저 말하지 마세요.

4. 자발 발화 허용 풀
   - 다음 풀에 있는 발화는 자연스럽게 섞어도 됩니다 (GT 슬롯 정보 포함 안 함):
${proactivePool}

5. Open Question 처리
   - AI 가 "혹시 더 말씀하실 게 있나요" 또는 "추가로 기억나는 게 있나요" 같은 open question 을 던지면, 다음과 같이만 답하세요:
   - "${c.simulator.open_question_response}"

6. 이미 답한 사실은 일관되게 유지하세요.
   - 같은 정보를 다시 물으면 같은 답을 하세요.

7. 법률 전문가처럼 말하지 마세요.
   - "묵시적 갱신", "대항력", "임차권등기명령" 같은 법률 용어를 먼저 사용하지 마세요.
   - AI 가 그 용어를 사용하면 그제서야 "그게 뭔지 잘 모르겠어요" 또는 의뢰인 입장에서 답하세요.

8. 법률 자문이나 문안 작성을 절대 요청하지 마세요. (매우 중요)
   - 당신은 사실관계를 답변하는 의뢰인일 뿐, 자문을 받으러 온 것이 아닙니다.
   - AI 가 "문안 써드릴까요", "보내는 법 알려드릴까요", "이어서 안내드릴까요" 같은 자문 제안을 하면:
     - "지금은 괜찮아요" 또는 "${c.simulator.open_question_response}" 라고 짧게 답하세요.
   - 절대로 "문구 부탁드려요", "정중한 버전도", "체크리스트 알려주세요", "보내는 법 알려주세요" 같은 자문 요청 발화를 하지 마세요.
   - 법적 절차, 대응 방법, 문구 작성을 먼저 요청하지 마세요.

9. AI 가 phase 를 'ready_to_advise' 로 전환하고 추가 정보를 요청하지 않으면, 대화를 자연스럽게 마무리하세요.
   - 새로운 사실관계 정보를 자발 발화로 추가하지 말고, 짧게 "네", "감사합니다", "${c.simulator.open_question_response}" 정도로만 응답하세요.

지금부터 AI 와 대화를 시작합니다. 위 규칙을 엄격히 지키세요.`;
}

// ============================================================
// Simulator Class
// ============================================================

export class ClientSimulator {
  private openai: OpenAI;
  private model: string;
  private case: GoldenSetCase;
  private systemPrompt: string;
  private history: SimulatorTurn[] = [];
  private temperature: number;

  constructor(
    c: GoldenSetCase,
    options?: {
      openaiClient?: OpenAI;
      model?: string;
      temperature?: number;
    }
  ) {
    this.openai = options?.openaiClient ?? new OpenAI();
    this.model =
      options?.model ?? process.env.OPENAI_SIMULATOR_MODEL ?? "gpt-5.4-mini";
    this.temperature = options?.temperature ?? 0.3; // 데모용 안정성 우선
    this.case = c;
    this.systemPrompt = buildSimulatorSystemPrompt(c);
  }

  /**
   * 첫 발화 반환 - LLM 호출 없이 frontmatter 의 first_utterance 직접 사용.
   * 이렇게 해야 모든 시스템(GPT/Claude/IA) 이 동일한 첫 발화에서 시작.
   */
  getFirstUtterance(): string {
    const utterance = this.case.first_utterance.trim();
    this.history.push({ role: "client", content: utterance });
    return utterance;
  }

  /**
   * AI 메시지를 받고 의뢰인의 다음 답변 생성.
   */
  async respondToAI(aiMessage: string): Promise<string> {
    this.history.push({ role: "ai", content: aiMessage });

    const messages = [
      { role: "system" as const, content: this.systemPrompt },
      ...this.history.map((turn) => ({
        // 시뮬레이터 = 의뢰인 = assistant role
        // AI(IA/GPT/Claude) = 외부 입력 = user role
        role:
          turn.role === "client" ? ("assistant" as const) : ("user" as const),
        content: turn.content,
      })),
    ];

    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages,
      temperature: this.temperature,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    this.history.push({ role: "client", content: reply });
    return reply;
  }

  getHistory(): SimulatorTurn[] {
    return [...this.history];
  }

  getCase(): GoldenSetCase {
    return this.case;
  }

  /**
   * 메타 평가용 - 시뮬레이터가 §8-3 규칙을 위반했는지 (GT 슬롯 자발 발화)
   * 검출하는 헬퍼. 데모 후 시뮬레이터 품질 검증에 사용.
   *
   * 단순 휴리스틱: 슬롯 value 의 문자열 표현이 자발 발화 턴에 등장했는지 확인.
   * 정교한 평가는 별도 LLM-as-Judge 로 구현 예정.
   */
  detectProactiveDisclosure(): { turn: number; suspectedSlot: string }[] {
    const violations: { turn: number; suspectedSlot: string }[] = [];
    const gt = this.case.ground_truth;

    for (let i = 0; i < this.history.length; i++) {
      const turn = this.history[i];
      if (turn.role !== "client") continue;

      // 이전 AI 메시지가 없으면 (첫 발화) GT 노출 검사 안 함
      const prevAI = i > 0 ? this.history[i - 1] : null;
      if (!prevAI || prevAI.role !== "ai") {
        // 첫 발화는 first_utterance 그대로이므로 검증 대상 아님
        continue;
      }

      // 각 GT 슬롯에 대해, value 가 client 발화에 등장했고 직전 AI 가 그 슬롯을 묻지 않았다면 위반
      for (const [slotKey, gtValue] of Object.entries(gt)) {
        const valueStr = String(gtValue.value);
        if (valueStr.length < 3) continue; // 너무 짧으면 false positive 위험

        if (
          turn.content.includes(valueStr) &&
          !this.didAIQueryAboutSlot(prevAI.content, slotKey)
        ) {
          violations.push({ turn: i, suspectedSlot: slotKey });
        }
      }
    }

    return violations;
  }

  /**
   * AI 메시지가 특정 슬롯에 대해 질문했는지 휴리스틱 검사.
   * (정확한 검출은 LLM-as-Judge 필요, 여기선 단순 키워드 매칭)
   */
  private didAIQueryAboutSlot(aiMessage: string, slotKey: string): boolean {
    const slotKeywords: Record<string, string[]> = {
      has_contract_doc: ["계약서"],
      contract_start_date: ["계약", "시작", "언제"],
      contract_end_date: ["종료", "끝", "언제"],
      deposit_amount: ["보증금", "얼마"],
      unreturned_amount: ["미반환", "못 받은", "남은"],
      has_resident_reg: ["전입신고"],
      has_fixed_date: ["확정일자"],
      has_moved_out: ["이사", "퇴거", "거주"],
      notice_date: ["통보", "언제", "말했"],
      notice_method: ["방식", "어떻게", "카톡", "문자", "전화"],
      landlord_responded: ["답변", "뭐라", "집주인"],
      has_kakao_records: ["카톡", "카카오", "기록"],
      has_certified_mail: ["내용증명"],
      has_transfer_records: ["계좌이체", "이체", "입금"],
      has_lien_registration: ["임차권등기"],
      registry_check: ["등기부"],
    };

    const keywords = slotKeywords[slotKey] || [];
    return keywords.some((kw) => aiMessage.includes(kw));
  }
}
