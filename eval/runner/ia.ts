/**
 * IA Runner - Intake Assistant 의 /api/multiturn 호출 래퍼.
 *
 * 평가 자동화에서 IA 를 한 시스템으로 취급할 수 있게 추상화.
 * baseline runner (gpt.ts, claude.ts) 와 동일한 인터페이스를 제공해
 * runExperiment.ts 에서 시스템을 교체 가능하게 함.
 *
 * 전제: Next.js dev 서버가 떠 있어야 함 (npm run dev, port 3000).
 * 환경변수 IA_API_URL 로 base URL 변경 가능.
 */

// ============================================================
// Types - src/core/schemas/turn.ts 와 동기화 유지 필요
// ============================================================

export type CollectedStatus = "confirmed" | "unknown" | "not_applicable";

export interface CollectedItem {
  key: string;
  status: CollectedStatus;
  value: string | null;
}

export type Phase = "collecting" | "ready_to_advise" | "done";

/** /api/multiturn 응답 형식 */
export interface IATurnResponse {
  reply: string;
  collected: CollectedItem[];
  phase: Phase;
  duration_ms?: number;
}

/** 시스템 응답 공통 인터페이스 (IA / GPT baseline / Claude baseline 공유) */
export interface SystemTurnResponse {
  reply: string;
  collected: CollectedItem[];          // baseline 은 빈 배열, IA 만 채움
  phase: Phase;                         // baseline 은 "collecting" 고정 가능
  duration_ms?: number;
}

/** 모든 시스템 runner 가 구현해야 할 공통 인터페이스 */
export interface SystemRunner {
  systemName: string;                   // "ia" | "gpt_baseline" | "claude_baseline"
  sendMessage(message: string): Promise<SystemTurnResponse>;
  reset(): void;                        // 새 케이스 시작 시 상태 초기화
}

// ============================================================
// IA Runner
// ============================================================

export interface IARunnerOptions {
  baseUrl?: string;                     // 기본값: http://localhost:3000
  sessionIdPrefix?: string;             // sessionId 생성 시 prefix (디버깅용)
}

export class IARunner implements SystemRunner {
  readonly systemName = "ia";
  private baseUrl: string;
  private sessionIdPrefix: string;
  private sessionId: string;
  private lastResponse: IATurnResponse | null = null;

  constructor(options: IARunnerOptions = {}) {
    this.baseUrl =
      options.baseUrl ?? process.env.IA_API_URL ?? "http://localhost:3000";
    this.sessionIdPrefix = options.sessionIdPrefix ?? "eval";
    this.sessionId = this.generateSessionId();
  }

  /**
   * 시뮬레이터의 의뢰인 메시지를 IA 에 전달하고 응답 받음.
   */
  async sendMessage(message: string): Promise<SystemTurnResponse> {
    const response = await fetch(`${this.baseUrl}/api/multiturn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: this.sessionId, message }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `IA API error (${response.status}): ${errorBody}\nsessionId=${this.sessionId}`,
      );
    }

    const result = (await response.json()) as IATurnResponse;
    this.lastResponse = result;
    return result;
  }

  /**
   * 새 케이스 시작 시 호출. 새 sessionId 발급해서 IA 인메모리 store 에서
   * 독립적인 세션으로 처리되게 함.
   */
  reset(): void {
    this.sessionId = this.generateSessionId();
    this.lastResponse = null;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getLastResponse(): IATurnResponse | null {
    return this.lastResponse;
  }

  private generateSessionId(): string {
    const ts = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    return `${this.sessionIdPrefix}-${ts}-${rand}`;
  }
}

// ============================================================
// Health Check Helper
// ============================================================

/**
 * IA 서버가 응답하는지 확인. 평가 실행 전 sanity check 용.
 * 단순히 ping 메시지 하나 보내고 응답 형식 검증.
 */
export async function checkIAHealth(baseUrl?: string): Promise<{
  ok: boolean;
  error?: string;
  sample?: SystemTurnResponse;
}> {
  const runner = new IARunner({
    baseUrl,
    sessionIdPrefix: "healthcheck",
  });

  try {
    const result = await runner.sendMessage("안녕하세요");
    if (
      typeof result.reply !== "string" ||
      !Array.isArray(result.collected) ||
      typeof result.phase !== "string"
    ) {
      return {
        ok: false,
        error: `Invalid response shape: ${JSON.stringify(result).slice(0, 200)}`,
      };
    }
    return { ok: true, sample: result };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
