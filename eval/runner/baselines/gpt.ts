/**
 * GPT Baseline Runner - 일반 상담 보조 역할만 부여한 GPT.
 *
 * 광현 6/18 "공정 비교" 이슈에 대한 응답:
 *  - 체크리스트도 멀티턴 지침도 없는 "일반 프롬프트"
 *  - IA 의 "프롬프트 설계 가치"가 비교에서 명확히 드러나도록
 *
 * collected 는 항상 빈 배열, phase 는 항상 "collecting".
 * baseline 응답에서 슬롯 추출은 별도 채점 단계 (Evaluator) 에서 수행.
 */

import OpenAI from "openai";

import type {
  SystemRunner,
  SystemTurnResponse,
  Phase,
  CollectedItem,
} from "../ia";

// ============================================================
// Baseline 공통 시스템 프롬프트
// ============================================================
// 의도적으로 짧고 일반적. 체크리스트, phase, 멀티턴 지침 일절 없음.

export const BASELINE_SYSTEM_PROMPT = `당신은 임대차 분쟁 상담을 돕는 AI 어시스턴트입니다.
의뢰인의 상황을 듣고, 필요한 정보가 있다면 질문해 주세요.
법률 자문은 하지 마세요.`;

// ============================================================
// GPT Baseline Runner
// ============================================================

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GPTBaselineOptions {
  openaiClient?: OpenAI;
  model?: string;
  temperature?: number;
}

export class GPTBaselineRunner implements SystemRunner {
  readonly systemName = "gpt_baseline";
  private openai: OpenAI;
  private model: string;
  private temperature: number;
  private history: ChatMessage[] = [];

  constructor(options: GPTBaselineOptions = {}) {
    this.openai = options.openaiClient ?? new OpenAI();
    this.model =
      options.model ?? process.env.OPENAI_BASELINE_MODEL ?? "gpt-5-mini";
    this.temperature = options.temperature ?? 0.7;
  }

  async sendMessage(message: string): Promise<SystemTurnResponse> {
    const startMs = Date.now();
    this.history.push({ role: "user", content: message });

    const messages: ChatMessage[] = [
      { role: "system", content: BASELINE_SYSTEM_PROMPT },
      ...this.history,
    ];

    // 일부 모델 (gpt-5 reasoning 계열 등) 은 temperature 기본값(1)만 지원함.
    // 명시적으로 보내지 않으면 자동으로 기본값 사용 → 호환성 최대화
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    this.history.push({ role: "assistant", content: reply });

    return {
      reply,
      collected: [] as CollectedItem[],   // baseline 은 슬롯 추출 안 함
      phase: "collecting" as Phase,        // baseline 은 phase 개념 없음
      duration_ms: Date.now() - startMs,
    };
  }

  reset(): void {
    this.history = [];
  }

  getHistory(): ChatMessage[] {
    return [...this.history];
  }
}
