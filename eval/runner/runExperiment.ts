/**
 * Experiment Orchestrator - sim ↔ system 한 케이스 자동 실행.
 *
 * 사용:
 *   npx tsx eval/runner/runExperiment.ts <case_id> <system>
 *
 *   case_id: IA-CASE-002 등 (cases/ 디렉토리에 있는 파일명 기준)
 *   system: "ia" (현재). 다음 단계에서 "gpt_baseline", "claude_baseline" 추가
 *
 * 출력: 콘솔에 대화 로그 + 최종 collected + 종료 사유.
 *       eval/runner/results/<case_id>-<system>-<timestamp>.json 로 저장.
 */

import fs from "fs";
import path from "path";
import { loadEnvConfig } from "@next/env";

import {
  ClientSimulator,
  loadCase,
  loadCasesFromDir,
  type GoldenSetCase,
} from "./simulator";
import {
  IARunner,
  checkIAHealth,
  type SystemRunner,
  type SystemTurnResponse,
} from "./ia";

loadEnvConfig(process.cwd());

// ============================================================
// Types
// ============================================================

export type EndReason =
  | "phase_done"
  | "max_turns_reached"
  | "ready_to_advise_window_done"
  | "baseline_done"
  | "simulator_done"
  | "system_error"
  | "simulator_error";

export interface ConversationTurn {
  turn: number;
  speaker: "client" | "ai";
  content: string;
  collected_snapshot?: SystemTurnResponse["collected"];
  phase_snapshot?: SystemTurnResponse["phase"];
  duration_ms?: number;
}

export interface ExperimentResult {
  case_id: string;
  case_title: string;
  system: string;
  started_at: string;
  ended_at: string;
  total_turns: number;
  end_reason: EndReason;
  final_collected: SystemTurnResponse["collected"];
  final_phase: SystemTurnResponse["phase"];
  conversation: ConversationTurn[];
  ground_truth: GoldenSetCase["ground_truth"];  // 채점용으로 같이 저장
  error?: string;
}

// ============================================================
// 단일 실험 실행
// ============================================================

export interface RunSingleExperimentOptions {
  case: GoldenSetCase;
  system: SystemRunner;
  maxTurns?: number;        // 기본 20
  verbose?: boolean;        // true 면 대화 콘솔 출력
}

export async function runSingleExperiment(
  opts: RunSingleExperimentOptions,
): Promise<ExperimentResult> {
  const { case: c, system, maxTurns = 12, verbose = true } = opts;
  const startedAt = new Date().toISOString();
  const conversation: ConversationTurn[] = [];
  let endReason: EndReason = "max_turns_reached";
  let finalCollected: SystemTurnResponse["collected"] = [];
  let finalPhase: SystemTurnResponse["phase"] = "collecting";
  let errorMsg: string | undefined;
  // ready_to_advise 도달 후 강제 종료 카운터 (-1: 미도달, n: 남은 턴 수)
  let readyToAdviseTurnsRemaining = -1;
  let shortReplyCount = 0;

  const simulator = new ClientSimulator(c);
  system.reset();

  try {
    // 첫 발화는 frontmatter 의 first_utterance 그대로 (LLM 호출 없이)
    const firstUtterance = simulator.getFirstUtterance();
    conversation.push({
      turn: 0,
      speaker: "client",
      content: firstUtterance,
    });
    if (verbose) {
      console.log(`\n[Turn 0 - 의뢰인] ${firstUtterance}\n`);
    }

    // 첫 IA 응답
    let aiResponse = await system.sendMessage(firstUtterance);
    finalCollected = aiResponse.collected;
    finalPhase = aiResponse.phase;
    conversation.push({
      turn: 0,
      speaker: "ai",
      content: aiResponse.reply,
      collected_snapshot: aiResponse.collected,
      phase_snapshot: aiResponse.phase,
      duration_ms: aiResponse.duration_ms,
    });
    if (verbose) {
      console.log(
        `[Turn 0 - AI / phase=${aiResponse.phase} / collected=${aiResponse.collected.length}]\n${aiResponse.reply}\n`,
      );
    }

    // 종료 조건이 첫 응답에서 이미 done 이면 바로 종료
    if (aiResponse.phase === "done") {
      endReason = "phase_done";
    } else {
      // 첫 응답에서 ready_to_advise 도달 시 카운터 시작
      if (aiResponse.phase === "ready_to_advise" && readyToAdviseTurnsRemaining === -1) {
        readyToAdviseTurnsRemaining = 2;
      }
      // 멀티턴 루프
      for (let turn = 1; turn < maxTurns; turn++) {
        // 시뮬레이터가 AI 응답에 답변
        let clientReply: string;
        try {
          clientReply = await simulator.respondToAI(aiResponse.reply);
        } catch (err) {
          endReason = "simulator_error";
          errorMsg = err instanceof Error ? err.message : String(err);
          break;
        }
        conversation.push({
          turn,
          speaker: "client",
          content: clientReply,
        });
        if (verbose) {
          console.log(`[Turn ${turn} - 의뢰인] ${clientReply}\n`);
        }

        // IA 가 답변
        try {
          aiResponse = await system.sendMessage(clientReply);
        } catch (err) {
          endReason = "system_error";
          errorMsg = err instanceof Error ? err.message : String(err);
          break;
        }
        finalCollected = aiResponse.collected;
        finalPhase = aiResponse.phase;
        conversation.push({
          turn,
          speaker: "ai",
          content: aiResponse.reply,
          collected_snapshot: aiResponse.collected,
          phase_snapshot: aiResponse.phase,
          duration_ms: aiResponse.duration_ms,
        });
        if (verbose) {
          console.log(
            `[Turn ${turn} - AI / phase=${aiResponse.phase} / collected=${aiResponse.collected.length}]\n${aiResponse.reply}\n`,
          );
        }

        // 종료 조건
        if (aiResponse.phase === "done") {
          endReason = "phase_done";
          break;
        }

        // baseline 종료 조건: "상담 준비가 완료되었습니다" 문구 감지
        if (aiResponse.reply.includes("상담 준비가 완료되었습니다")) {
          endReason = "baseline_done";
          break;
        }

        // 시뮬레이터 단답 연속 2번 시 종료
        const SHORT_REPLIES = ["네", "감사합니다", "지금 생각나는 건 없어요", "알겠습니다"];
        if (SHORT_REPLIES.some((r) => clientReply.trim() === r)) {
          shortReplyCount++;
          if (shortReplyCount >= 2) {
            endReason = "simulator_done";
            break;
          }
        } else {
          shortReplyCount = 0;
        }

        // ready_to_advise 도달 시점부터 카운트다운 (한 번만 시작)
        if (aiResponse.phase === "ready_to_advise" && readyToAdviseTurnsRemaining === -1) {
          readyToAdviseTurnsRemaining = 2;
        }
        // 카운트다운 진행: 0 이 되면 강제 종료
        if (readyToAdviseTurnsRemaining > 0) {
          readyToAdviseTurnsRemaining--;
          if (readyToAdviseTurnsRemaining === 0) {
            endReason = "ready_to_advise_window_done";
            break;
          }
        }
      }
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
    if (!endReason || endReason === "max_turns_reached") {
      endReason = "system_error";
    }
  }

  const endedAt = new Date().toISOString();
  const totalTurns = Math.floor(conversation.length / 2);

  return {
    case_id: c.case_id,
    case_title: c.case_title,
    system: system.systemName,
    started_at: startedAt,
    ended_at: endedAt,
    total_turns: totalTurns,
    end_reason: endReason,
    final_collected: finalCollected,
    final_phase: finalPhase,
    conversation,
    ground_truth: c.ground_truth,
    error: errorMsg,
  };
}

// ============================================================
// 결과 저장
// ============================================================

export function saveResult(
  result: ExperimentResult,
  resultsDir: string = "eval/runner/results",
): string {
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  const timestamp = result.started_at.replace(/[:.]/g, "-");
  const filename = `${result.case_id}-${result.system}-${timestamp}.json`;
  const filepath = path.join(resultsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(result, null, 2), "utf-8");
  return filepath;
}

// ============================================================
// CLI Entry Point
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(
      "Usage: npx tsx eval/runner/runExperiment.ts <case_id> <system>",
    );
    console.error(
      "  case_id: IA-CASE-002 (cases/ 디렉토리에 frontmatter 가 있어야 함)",
    );
    console.error("  system:  ia | gpt_baseline | claude_baseline");
    process.exit(1);
  }

  const [caseId, systemName] = args;
  const casesDir = path.resolve(process.cwd(), "eval/golden-set/cases");
  const casePath = path.join(casesDir, `${caseId}.md`);

  if (!fs.existsSync(casePath)) {
    console.error(`Case file not found: ${casePath}`);
    process.exit(1);
  }

  const c = loadCase(casePath);
  if (!c) {
    console.error(`Case file is empty or invalid: ${casePath}`);
    process.exit(1);
  }

  console.log(`\n=== Running Experiment ===`);
  console.log(`Case:   ${c.case_id} - ${c.case_title}`);
  console.log(`System: ${systemName}`);
  console.log(`Persona: ${c.persona.name} (${c.client_type}, ${c.difficulty})`);
  console.log(`================================\n`);

  // System runner 선택
  let system: SystemRunner;
  if (systemName === "ia") {
    // IA 서버 health check
    console.log("Checking IA server health...");
    const health = await checkIAHealth();
    if (!health.ok) {
      console.error(`IA server health check failed: ${health.error}`);
      console.error("\nIA dev server 가 실행 중인지 확인하세요: npm run dev");
      process.exit(1);
    }
    console.log("IA server OK.\n");
    system = new IARunner();
  } else if (systemName === "gpt_baseline") {
    console.log(`Using GPT baseline (model: ${process.env.OPENAI_BASELINE_MODEL ?? "gpt-5-mini"})\n`);
    const { GPTBaselineRunner } = await import("./baselines/gpt");
    system = new GPTBaselineRunner();
  } else if (systemName === "claude_baseline") {
    console.log(`Using Claude baseline (model: ${process.env.CLAUDE_BASELINE_MODEL ?? "claude-sonnet-4-6"})\n`);
    const { ClaudeBaselineRunner } = await import("./baselines/claude");
    system = new ClaudeBaselineRunner();
  } else {
    console.error(`Unsupported system: ${systemName}`);
    console.error("Currently supported: ia, gpt_baseline, claude_baseline");
    process.exit(1);
  }

  // 실험 실행
  const result = await runSingleExperiment({
    case: c,
    system,
    maxTurns: 12,
    verbose: true,
  });

  // 결과 저장
  const savedPath = saveResult(result);

  // 요약 출력
  console.log("\n=== Experiment Complete ===");
  console.log(`Total turns:    ${result.total_turns}`);
  console.log(`End reason:     ${result.end_reason}`);
  console.log(`Final phase:    ${result.final_phase}`);
  console.log(`Slots collected: ${result.final_collected.length}/16`);
  if (result.error) {
    console.log(`Error:          ${result.error}`);
  }
  console.log(`Saved to:       ${savedPath}`);
  console.log("================================\n");
}

// 직접 실행될 때만 main 호출 (require/import 시엔 안 함)
if (require.main === module) {
  main().catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });
}
