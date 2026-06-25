/**
 * Claude Baseline Runner - 일반 상담 보조 역할만 부여한 Claude.
 *
 * GPT baseline 과 동일한 시스템 프롬프트 사용.
 * provider 분리로 IA(OpenAI) vs Claude baseline 비교에서 모델 차이를 봄.
 *
 * 의존성: npm install @anthropic-ai/sdk
 * 환경변수: ANTHROPIC_API_KEY, CLAUDE_BASELINE_MODEL (옵션)
 */

import Anthropic from "@anthropic-ai/sdk";

import type {
  SystemRunner,
  SystemTurnResponse,
  Phase,
  CollectedItem,
} from "../ia";
import { BASELINE_SYSTEM_PROMPT } from "./gpt";

// ============================================================
// Claude Baseline Runner
// ============================================================

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeBaselineOptions {
  anthropicClient?: Anthropic;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class ClaudeBaselineRunner implements SystemRunner {
  readonly systemName = "claude_baseline";
  private anthropic: Anthropic;
  private model: string;
  private maxTokens: number;
  private temperature: number;
  private history: AnthropicMessage[] = [];

  constructor(options: ClaudeBaselineOptions = {}) {
    this.anthropic = options.anthropicClient ?? new Anthropic();
    this.model =
      options.model ?? process.env.CLAUDE_BASELINE_MODEL ?? "claude-sonnet-4-6";
    this.maxTokens = options.maxTokens ?? 1024;
    this.temperature = options.temperature ?? 0.7;
  }

  async sendMessage(message: string): Promise<SystemTurnResponse> {
    const startMs = Date.now();
    this.history.push({ role: "user", content: message });

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      system: BASELINE_SYSTEM_PROMPT,
      messages: this.history,
    });

    // Anthropic 응답에서 텍스트 추출
    let reply = "";
    for (const block of response.content) {
      if (block.type === "text") {
        reply += block.text;
      }
    }
    reply = reply.trim();

    this.history.push({ role: "assistant", content: reply });

    return {
      reply,
      collected: [] as CollectedItem[],
      phase: "collecting" as Phase,
      duration_ms: Date.now() - startMs,
    };
  }

  reset(): void {
    this.history = [];
  }

  getHistory(): AnthropicMessage[] {
    return [...this.history];
  }
}
