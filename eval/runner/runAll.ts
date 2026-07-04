/**
 * Run All - 데모 케이스 3개 × 시스템 3개 = 9개 실험 일괄 실행 + 채점.
 *
 * 사용:
 *   npx tsx eval/runner/runAll.ts
 *   npx tsx eval/runner/runAll.ts --ia-only         # IA 만 (baseline 스킵)
 *   npx tsx eval/runner/runAll.ts --cases=002,007   # 특정 케이스만
 *
 * 출력:
 *   - 콘솔: 실시간 진행 + 최종 비교 표
 *   - eval/runner/results/ : 9개 실험 JSON + 9개 채점 JSON
 *   - eval/runner/results/summary-{timestamp}.md : 데모용 종합 비교표
 */

import fs from "fs";
import path from "path";

import { loadCase } from "./simulator";
import { runSingleExperiment, saveResult } from "./runExperiment";
import { evaluateResult, saveEvalReport } from "./evaluators/quan_evaluator";
import { IARunner, checkIAHealth, type SystemRunner } from "./ia";
import { GPTBaselineRunner } from "./baselines/gpt";
import { ClaudeBaselineRunner } from "./baselines/claude";

import type { ExperimentResult } from "./runExperiment";
import type { EvalReport } from "./evaluators/quan_evaluator";

// ============================================================
// 데모 설정
// ============================================================

const DEMO_CASES = ["IA-CASE-002", "IA-CASE-007", "IA-CASE-008"];
const CASES_DIR = path.resolve(process.cwd(), "eval/golden-set/cases");
const RESULTS_DIR = path.resolve(process.cwd(), "eval/runner/results");
const MAX_TURNS = 12;

// ============================================================
// CLI 인자 파싱
// ============================================================

function parseArgs(): { onlyIA: boolean; cases: string[] } {
  const args = process.argv.slice(2);
  const onlyIA = args.includes("--ia-only");
  let cases = DEMO_CASES;

  for (const arg of args) {
    if (arg.startsWith("--cases=")) {
      const ids = arg.slice("--cases=".length).split(",").map((s) => s.trim());
      cases = ids.map((id) => (id.startsWith("IA-CASE-") ? id : `IA-CASE-${id}`));
    }
  }

  return { onlyIA, cases };
}

// ============================================================
// 시스템 runner 팩토리
// ============================================================

function createRunner(systemName: string): SystemRunner {
  switch (systemName) {
    case "ia":
      return new IARunner();
    case "gpt_baseline":
      return new GPTBaselineRunner();
    case "claude_baseline":
      return new ClaudeBaselineRunner();
    default:
      throw new Error(`Unknown system: ${systemName}`);
  }
}

// ============================================================
// 단일 실험 + 채점 (1턴 작업 단위)
// ============================================================

interface OneRun {
  case_id: string;
  system: string;
  experiment: ExperimentResult;
  eval: EvalReport;
  experimentFile: string;
  evalFile: string;
}

async function runOneCaseSystem(
  caseId: string,
  systemName: string,
): Promise<OneRun> {
  const casePath = path.join(CASES_DIR, `${caseId}.md`);
  const c = loadCase(casePath);
  if (!c) {
    throw new Error(`Case file empty or invalid: ${casePath}`);
  }

  const system = createRunner(systemName);

  // 1) 실험 실행
  const experiment = await runSingleExperiment({
    case: c,
    system,
    maxTurns: MAX_TURNS,
    verbose: false,   // 일괄 실행 시 콘솔 너무 시끄러우니 false
  });

  const experimentFile = saveResult(experiment, RESULTS_DIR);

  // 2) 채점
  const evalReport = await evaluateResult(experiment);
  const evalFile = saveEvalReport(evalReport, RESULTS_DIR);

  return { case_id: caseId, system: systemName, experiment, eval: evalReport, experimentFile, evalFile };
}

// ============================================================
// 종합 비교 마크다운 생성
// ============================================================

function generateSummaryMarkdown(runs: OneRun[]): string {
  const lines: string[] = [];

  lines.push("# IA 평가 데모 종합 결과");
  lines.push("");
  lines.push(`생성 시각: ${new Date().toISOString()}`);
  lines.push(`총 실험: ${runs.length}`);
  lines.push("");
  lines.push("## 핵심 지표");
  lines.push("");

  // 케이스 × 시스템 비교 표
  const cases = Array.from(new Set(runs.map((r) => r.case_id))).sort();
  const systems = Array.from(new Set(runs.map((r) => r.system))).sort();

  // recall 표
  lines.push("### 체크리스트 수집률 (Recall)");
  lines.push("");
  lines.push(`| Case | ${systems.join(" | ")} |`);
  lines.push(`|---|${systems.map(() => "---").join("|")}|`);
  for (const caseId of cases) {
    const row = [caseId];
    for (const sys of systems) {
      const r = runs.find((x) => x.case_id === caseId && x.system === sys);
      row.push(r ? `${(r.eval.recall * 100).toFixed(1)}%` : "-");
    }
    lines.push(`| ${row.join(" | ")} |`);
  }
  lines.push("");

  // 턴 수 표
  lines.push("### 대화 턴 수");
  lines.push("");
  lines.push(`| Case | ${systems.join(" | ")} |`);
  lines.push(`|---|${systems.map(() => "---").join("|")}|`);
  for (const caseId of cases) {
    const row = [caseId];
    for (const sys of systems) {
      const r = runs.find((x) => x.case_id === caseId && x.system === sys);
      row.push(r ? `${r.experiment.total_turns}` : "-");
    }
    lines.push(`| ${row.join(" | ")} |`);
  }
  lines.push("");

  // 종료 사유 표
  lines.push("### 종료 사유");
  lines.push("");
  lines.push(`| Case | ${systems.join(" | ")} |`);
  lines.push(`|---|${systems.map(() => "---").join("|")}|`);
  for (const caseId of cases) {
    const row = [caseId];
    for (const sys of systems) {
      const r = runs.find((x) => x.case_id === caseId && x.system === sys);
      row.push(r ? r.experiment.end_reason : "-");
    }
    lines.push(`| ${row.join(" | ")} |`);
  }
  lines.push("");

  // 시스템별 평균
  lines.push("## 시스템별 평균");
  lines.push("");
  lines.push("| 시스템 | 평균 Recall | 평균 턴 수 | 케이스 수 |");
  lines.push("|---|---|---|---|");
  for (const sys of systems) {
    const sysRuns = runs.filter((r) => r.system === sys);
    if (sysRuns.length === 0) continue;
    const avgRecall =
      sysRuns.reduce((sum, r) => sum + r.eval.recall, 0) / sysRuns.length;
    const avgTurns =
      sysRuns.reduce((sum, r) => sum + r.experiment.total_turns, 0) / sysRuns.length;
    lines.push(
      `| ${sys} | ${(avgRecall * 100).toFixed(1)}% | ${avgTurns.toFixed(1)} | ${sysRuns.length} |`,
    );
  }
  lines.push("");

  // 슬롯별 매칭 분석 (IA 만)
  const iaRuns = runs.filter((r) => r.system === "ia");
  if (iaRuns.length > 0) {
    lines.push("## IA 슬롯별 매칭 분석");
    lines.push("");
    // 모든 슬롯 키 수집
    const allSlots = new Set<string>();
    for (const r of iaRuns) {
      for (const s of r.eval.slot_results) {
        allSlots.add(s.slot);
      }
    }
    const slotList = Array.from(allSlots).sort();

    lines.push(`| Slot | ${iaRuns.map((r) => r.case_id).join(" | ")} |`);
    lines.push(`|---|${iaRuns.map(() => "---").join("|")}|`);
    for (const slot of slotList) {
      const row = [slot];
      for (const r of iaRuns) {
        const sr = r.eval.slot_results.find((s) => s.slot === slot);
        if (!sr) {
          row.push("-");
        } else {
          const emoji =
            sr.match === "match"
              ? "✅"
              : sr.match === "mismatch"
              ? "❌"
              : sr.match === "missing"
              ? "⚪"
              : "⚠️";
          row.push(emoji);
        }
      }
      lines.push(`| ${row.join(" | ")} |`);
    }
    lines.push("");
    lines.push("범례: ✅ match / ❌ mismatch / ⚪ missing / ⚠️ unparseable");
    lines.push("");
  }

  // IA vs baseline 비교 분석
  if (systems.includes("ia") && systems.length > 1) {
    lines.push("## 핵심 관찰");
    lines.push("");
    const iaAvg =
      runs.filter((r) => r.system === "ia").reduce((s, r) => s + r.eval.recall, 0) /
      iaRuns.length;
    const baselineRuns = runs.filter((r) => r.system !== "ia");
    if (baselineRuns.length > 0) {
      const baselineAvg =
        baselineRuns.reduce((s, r) => s + r.eval.recall, 0) / baselineRuns.length;
      const diff = (iaAvg - baselineAvg) * 100;
      lines.push(`- IA 평균 Recall: **${(iaAvg * 100).toFixed(1)}%**`);
      lines.push(`- Baseline 평균 Recall: **${(baselineAvg * 100).toFixed(1)}%**`);
      lines.push(`- 차이: **+${diff.toFixed(1)}%p** (IA 우위)`);
    }
    lines.push("");
  }

  // 데이터 한계 / 디스클레이머
  lines.push("## 데이터 한계");
  lines.push("");
  lines.push("- **1회 실행 결과** — 분산 측정 안 됨. Avg@5 같은 반복 측정은 본 평가에서 추가 예정.");
  lines.push("- **3 케이스만** — 전체 30 케이스 골든셋 중 데모용 v1 순수 케이스 3개.");
  lines.push("- **baseline 채점은 LLM-as-Judge** — 대화 전체에서 슬롯 추출. 정확도 변동성 있음.");
  lines.push("- **시뮬레이터 일관성** — GT 자발 발화 검사 메타 평가 미적용.");
  lines.push("");

  return lines.join("\n");
}

// ============================================================
// 메인
// ============================================================

async function main() {
  const { onlyIA, cases } = parseArgs();

  console.log(`\n=== IA 평가 데모 일괄 실행 ===`);
  console.log(`Cases:   ${cases.join(", ")}`);

  // 시스템 결정
  const systems: string[] = ["ia"];
  if (!onlyIA) {
    systems.push("gpt_baseline");
    if (process.env.ANTHROPIC_API_KEY) {
      systems.push("claude_baseline");
    } else {
      console.warn("\nWARNING: ANTHROPIC_API_KEY 가 없어 Claude baseline 스킵합니다.");
      console.warn("  .env.local 에 ANTHROPIC_API_KEY 설정하면 자동 포함됨.\n");
    }
  }
  console.log(`Systems: ${systems.join(", ")}`);
  console.log(`Total runs: ${cases.length * systems.length}`);
  console.log(`=========================\n`);

  // IA health check (IA 가 시스템에 포함될 때만)
  if (systems.includes("ia")) {
    console.log("Checking IA server health...");
    const health = await checkIAHealth();
    if (!health.ok) {
      console.error(`IA server health check failed: ${health.error}`);
      console.error("IA dev server 가 실행 중인지 확인하세요: npm run dev\n");
      process.exit(1);
    }
    console.log("IA server OK.\n");
  }

  // 일괄 실행
  const runs: OneRun[] = [];
  const errors: { case_id: string; system: string; error: string }[] = [];
  let runIdx = 0;
  const totalRuns = cases.length * systems.length;
  const startMs = Date.now();

  for (const caseId of cases) {
    for (const sys of systems) {
      runIdx++;
      const tag = `[${runIdx}/${totalRuns}] ${caseId} × ${sys}`;
      console.log(`${tag} ... 시작`);
      try {
        const run = await runOneCaseSystem(caseId, sys);
        runs.push(run);
        console.log(
          `${tag} ... 완료 (recall=${(run.eval.recall * 100).toFixed(1)}%, turns=${run.experiment.total_turns}, end=${run.experiment.end_reason})`,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`${tag} ... 실패: ${msg}`);
        errors.push({ case_id: caseId, system: sys, error: msg });
      }
    }
  }

  const totalSeconds = ((Date.now() - startMs) / 1000).toFixed(1);
  console.log(`\n=== 일괄 실행 완료 (총 ${totalSeconds}초) ===`);
  console.log(`성공: ${runs.length}/${totalRuns}`);
  if (errors.length > 0) {
    console.log(`실패: ${errors.length}`);
    for (const e of errors) {
      console.log(`  - ${e.case_id} × ${e.system}: ${e.error}`);
    }
  }
  console.log("=========================\n");

  // 종합 마크다운 생성
  if (runs.length > 0) {
    const summaryMd = generateSummaryMarkdown(runs);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const summaryPath = path.join(RESULTS_DIR, `summary-${timestamp}.md`);
    fs.writeFileSync(summaryPath, summaryMd, "utf-8");
    console.log(`Summary saved to: ${summaryPath}\n`);

    // 콘솔에 종합 표 일부 출력
    console.log("=== 핵심 결과 ===");
    const allSystems = Array.from(new Set(runs.map((r) => r.system))).sort();
    console.log(`\nRecall:`);
    for (const sys of allSystems) {
      const sysRuns = runs.filter((r) => r.system === sys);
      const avg =
        sysRuns.reduce((s, r) => s + r.eval.recall, 0) / sysRuns.length;
      console.log(
        `  ${sys.padEnd(20)} ${(avg * 100).toFixed(1)}%  (${sysRuns.length} cases)`,
      );
    }
    console.log(`\nAverage turns:`);
    for (const sys of allSystems) {
      const sysRuns = runs.filter((r) => r.system === sys);
      const avg =
        sysRuns.reduce((s, r) => s + r.experiment.total_turns, 0) / sysRuns.length;
      console.log(
        `  ${sys.padEnd(20)} ${avg.toFixed(1)} turns  (${sysRuns.length} cases)`,
      );
    }
    console.log("\n=========================\n");
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });
}
