// 전역 timeout
import { Agent, setGlobalDispatcher } from "undici";

setGlobalDispatcher(new Agent({
  headersTimeout: 30000,
  bodyTimeout: 60000,
  connect: { timeout: 10000 },
}))

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { evaluate } from "langsmith/evaluation";

import { GPTBaselineRunner } from "./baselines/gpt";
import { ClaudeBaselineRunner } from "./baselines/claude";
import { loadCase } from "./simulator";
import { runSingleExperiment } from "./runExperiment";
import { quanEvaluator, qualEvaluator } from "./evaluators";
import { IARunner } from "./ia";

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
    evaluators: [quanEvaluator, qualEvaluator],
    experimentPrefix: "ia-eval",
    maxConcurrency: 1,
    numRepetitions: 3,
  });

  await evaluate(runGPT, {
    data: process.env.LANGSMITH_DATASET_NAME ?? "ia-golden-set",
    evaluators: [quanEvaluator, qualEvaluator],
    experimentPrefix: "gpt-eval",
    maxConcurrency: 1,
    numRepetitions: 3,
  });

  await evaluate(runClaude, {
    data: process.env.LANGSMITH_DATASET_NAME ?? "ia-golden-set",
    evaluators: [quanEvaluator, qualEvaluator],
    experimentPrefix: "claude-eval",
    maxConcurrency: 1,
    numRepetitions: 3,
  });
}

main().catch(console.error);
