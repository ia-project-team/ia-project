import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { evaluate } from "langsmith/evaluation";

import { GPTBaselineRunner } from "./baselines/gpt";
import { ClaudeBaselineRunner } from "./baselines/claude";
import { loadCase } from "./simulator";
import { runSingleExperiment } from "./runExperiment";
import { evaluateResult } from "./evaluators/quan_evaluator";
import { IARunner } from "./ia";
import type { ExperimentResult } from "./runExperiment";

async function runIA(inputs: Record<string, unknown>) {
  const caseId = inputs.case_id as string;
  
  const casePath = `eval/golden-set/cases/${caseId}.md`;
  const c = loadCase(casePath);
  if (!c) throw new Error(`Case not found: ${caseId}`);

  const system = new IARunner();
  const result = await runSingleExperiment({
    case: c,
    system,
    maxTurns: 12,
    verbose: false,
  });

  return result;
}

async function recallEvaluator({
  outputs,
  referenceOutputs,
}: {
  outputs: Record<string, unknown>;
  referenceOutputs?: Record<string, unknown>;
}) {
  const result = outputs as unknown as ExperimentResult;
  const report = await evaluateResult(result);

  return {
    key: "recall",
    score: report.recall,
  };
}

async function runGPT(inputs: Record<string, unknown>) {
  const caseId = inputs.case_id as string;

  const casePath = `eval/golden-set/cases/${caseId}.md`;
  const c = loadCase(casePath);
  if (!c) throw new Error(`Case not found: ${caseId}`);

  const system = new GPTBaselineRunner();
  const result = await runSingleExperiment({
    case: c,
    system,
    maxTurns: 12,
    verbose: false,
  });

  return result;
}

async function runClaude(inputs: Record<string, unknown>) {
  const caseId = inputs.case_id as string;

  const casePath = `eval/golden-set/cases/${caseId}.md`;
  const c = loadCase(casePath);
  if (!c) throw new Error(`Case not found: ${caseId}`);

  const system = new ClaudeBaselineRunner();
  const result = await runSingleExperiment({
    case: c,
    system,
    maxTurns: 12,
    verbose: false,
  });

  return result;
}


async function main() {
  await evaluate(runIA, {
    data: process.env.LANGSMITH_DATASET_NAME ?? "ia-golden-set",
    evaluators: [recallEvaluator],
    experimentPrefix: "ia-eval",
    maxConcurrency: 1,
  });

  await evaluate(runGPT, {
    data: process.env.LANGSMITH_DATASET_NAME ?? "ia-golden-set",
    evaluators: [recallEvaluator],
    experimentPrefix: "gpt-eval",
    maxConcurrency: 1,
  });

  await evaluate(runClaude, {
    data: process.env.LANGSMITH_DATASET_NAME ?? "ia-golden-set",
    evaluators: [recallEvaluator],
    experimentPrefix: "claude-eval",
    maxConcurrency: 1,
  });
}

main().catch(console.error);
