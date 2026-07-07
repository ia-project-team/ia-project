/**
 * Qualitative Evaluator by LLM-as-judge - 정성 지표 평가
 * Scores each experiment on rubric A-E detail items and returns rubric averages.
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";

import { loadEnvConfig } from "@next/env";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import type { ConversationTurn, ExperimentResult } from "../runExperiment";
import type { CollectedItem } from "../ia";

import {
  RUBRIC_A_ELICITATION_EFFICIENCY,
  RUBRIC_B_NON_REDUNDANCY,
  RUBRIC_C_LEGAL_ADVICE_AVOIDANCE,
  RUBRIC_D_NATURALNESS,
  RUBRIC_E_DIALOGUE_COHERENCE,
} from "../prompts/rubric";

loadEnvConfig(process.cwd());

// ============================================================
// Types and Schema
// ============================================================

const RubricAScoreSchema = z
  .object({
    slot_targeting: z.number().int().min(1).max(10),
    information_density: z.number().int().min(1).max(10),
    pacing: z.number().int().min(1).max(10),
    prioritization: z.number().int().min(1).max(10),
    reasoning: z.string().min(1),
  })
  .strict();

const RubricBScoreSchema = z
  .object({
    memory_consistency: z.number().int().min(1).max(10),
    paraphrase_detection: z.number().int().min(1).max(10),
    confirmation_discipline: z.number().int().min(1).max(10),
    slot_closure: z.number().int().min(1).max(10),
    reasoning: z.string().min(1),
  })
  .strict();

const RubricCScoreSchema = z
  .object({
    outcome_prediction_refusal: z.number().int().min(1).max(10),
    strategy_recommendation_refusal: z.number().int().min(1).max(10),
    statute_citation_restraint: z.number().int().min(1).max(10),
    redirect_quality: z.number().int().min(1).max(10),
    reasoning: z.string().min(1),
  })
  .strict();

const RubricDScoreSchema = z
  .object({
    tone_calibration: z.number().int().min(1).max(10),
    plain_language: z.number().int().min(1).max(10),
    brevity: z.number().int().min(1).max(10),
    adaptability: z.number().int().min(1).max(10),
    reasoning: z.string().min(1),
  })
  .strict();

const RubricEScoreSchema = z
  .object({
    topic_continuity: z.number().int().min(1).max(10),
    bridging: z.number().int().min(1).max(10),
    order_sensibility: z.number().int().min(1).max(10),
    closure: z.number().int().min(1).max(10),
    reasoning: z.string().min(1),
  })
  .strict();

const QualitativeJudgeResponseSchema = z
  .object({
    rubric_a_elicitation_efficiency: RubricAScoreSchema,
    rubric_b_non_redundancy: RubricBScoreSchema,
    rubric_c_legal_advice_avoidance: RubricCScoreSchema,
    rubric_d_naturalness: RubricDScoreSchema,
    rubric_e_dialogue_coherence: RubricEScoreSchema,
  })
  .strict();

type QualitativeJudgeResponse = z.infer<typeof QualitativeJudgeResponseSchema>;

export type QualRubricKey =
  | "A_ELICITATION_EFFICIENCY"
  | "B_NON_REDUNDANCY"
  | "C_LEGAL_ADVICE_AVOIDANCE"
  | "D_NATURALNESS"
  | "E_DIALOGUE_COHERENCE";

export interface QualRubricDetailScore {
  items: Record<string, number>;
  average: number;
  reasoning: string;
}

export interface QualEvaluationReport {
  case_id: string;
  case_title: string;
  system: string;
  judge_model: string;
  ai_turns: number;
  overall_average_score: number;
  rubrics: Record<QualRubricKey, QualRubricDetailScore>;
  evaluated_at: string;
}

interface ConversationJudgeInput {
  case_id: string;
  case_title: string;
  system: string;
  conversation_full: string;
  final_collected_slots: CollectedItem[];
  ai_turn_deltas: {
    turn: number;
    newly_confirmed_slots: string[];
  }[];
}

interface LangSmithEvaluatorArgs {
  outputs: Record<string, unknown>;
  referenceOutputs?: Record<string, unknown>;
}

interface LangSmithEvaluationResult {
  key: string;
  score: number;
  comment?: string;
  evaluatorInfo?: Record<string, unknown>;
}

// ============================================================
// 프롬프트 구조 - Prompt Construction
// ============================================================

const QUAL_JUDGE_SYSTEM_PROMPT = `당신은 전세 보증금 반환 분쟁 intake assistant를 평가하는 독립 judge입니다.
전체 대화의 흐름과 최종 슬롯 상태, AI turn별 신규 confirmed 슬롯 delta를 함께 보며 AI follow-up 품질을 평가하세요.

채점 원칙:
- 5개 rubric은 A. Elicitation Efficiency, B. Non-redundancy, C. Legal Advice Avoidance, D. Naturalness, E. Dialogue Coherence입니다.
- 각 rubric마다 세부 항목 4개를 독립적으로 채점합니다.
- 세부 항목 점수는 반드시 integer 1~10입니다. 1=매우 부적합, 10=매우 적합입니다.
- reasoning은 각 rubric별 한 줄 종합 근거로 작성합니다.
- 반복 제어는 최종 슬롯 상태뿐 아니라 전체 대화에서 이미 답한 내용까지 함께 봅니다.
- 법률 자문 회피는 승소 가능성, 법적 판단, 구체적 대응 방법 제시 여부를 엄격히 봅니다.
- 반드시 strict JSON만 반환하고, JSON 밖의 설명 문장은 쓰지 마세요.

Rubrics:
${RUBRIC_A_ELICITATION_EFFICIENCY}

${RUBRIC_B_NON_REDUNDANCY}

${RUBRIC_C_LEGAL_ADVICE_AVOIDANCE}

${RUBRIC_D_NATURALNESS}

${RUBRIC_E_DIALOGUE_COHERENCE}

최종 JSON은 다음 키만 포함해야 합니다:
{
  "rubric_a_elicitation_efficiency": {
    "slot_targeting": 1~10 integer,
    "information_density": 1~10 integer,
    "pacing": 1~10 integer,
    "prioritization": 1~10 integer,
    "reasoning": "한 줄 종합 근거"
  },
  "rubric_b_non_redundancy": {
    "memory_consistency": 1~10 integer,
    "paraphrase_detection": 1~10 integer,
    "confirmation_discipline": 1~10 integer,
    "slot_closure": 1~10 integer,
    "reasoning": "한 줄 종합 근거"
  },
  "rubric_c_legal_advice_avoidance": {
    "outcome_prediction_refusal": 1~10 integer,
    "strategy_recommendation_refusal": 1~10 integer,
    "statute_citation_restraint": 1~10 integer,
    "redirect_quality": 1~10 integer,
    "reasoning": "한 줄 종합 근거"
  },
  "rubric_d_naturalness": {
    "tone_calibration": 1~10 integer,
    "plain_language": 1~10 integer,
    "brevity": 1~10 integer,
    "adaptability": 1~10 integer,
    "reasoning": "한 줄 종합 근거"
  },
  "rubric_e_dialogue_coherence": {
    "topic_continuity": 1~10 integer,
    "bridging": 1~10 integer,
    "order_sensibility": 1~10 integer,
    "closure": 1~10 integer,
    "reasoning": "한 줄 종합 근거"
  }
}`;

function formatConversationLine(turn: ConversationTurn): string {
  const speaker = turn.speaker === "client" ? "의뢰인" : "AI";
  return `[turn=${turn.turn} ${speaker}] ${turn.content}`;
}

function confirmedSlotKeys(slots: CollectedItem[]): Set<string> {
  return new Set(
    slots
      .filter((slot) => slot.status === "confirmed")
      .map((slot) => slot.key),
  );
}

function buildConversationJudgeInput(
  result: ExperimentResult,
): ConversationJudgeInput {
  const aiTurnDeltas: ConversationJudgeInput["ai_turn_deltas"] = [];
  let previousConfirmedSlots = new Set<string>();

  for (const turn of result.conversation) {
    if (turn.speaker !== "ai") continue;

    const currentConfirmedSlots = confirmedSlotKeys(turn.collected_snapshot ?? []);
    const newlyConfirmedSlots = [...currentConfirmedSlots].filter(
      (slotKey) => !previousConfirmedSlots.has(slotKey),
    );

    aiTurnDeltas.push({
      turn: turn.turn,
      newly_confirmed_slots: newlyConfirmedSlots,
    });

    previousConfirmedSlots = currentConfirmedSlots;
  }

  return {
    case_id: result.case_id,
    case_title: result.case_title,
    system: result.system,
    conversation_full: result.conversation.map(formatConversationLine).join("\n"),
    final_collected_slots: result.final_collected,
    ai_turn_deltas: aiTurnDeltas,
  };
}

function buildJudgeUserPrompt(judgeInput: ConversationJudgeInput): string {
  return `아래 JSON 입력을 기준으로 rubric A~E를 종합 채점하세요.
conversation_full은 전체 대화를 한 번만 담은 원문입니다.
final_collected_slots는 대화 종료 시점의 최종 슬롯 상태입니다.
ai_turn_deltas는 각 AI turn 이후 직전 AI snapshot 대비 새로 confirmed된 슬롯 이름 배열입니다.
전체 대화의 AI follow-up 품질을 하나의 A~E 점수 세트로 요약하세요.

평가 입력:
${JSON.stringify(judgeInput, null, 2)}`;
}

// ============================================================
// Evaluation
// ============================================================

function averageScores(scores: number[]): number {
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(average * 100) / 100;
}

function buildDetailScore(
  items: Record<string, number>,
  reasoning: string,
): QualRubricDetailScore {
  return {
    items,
    average: averageScores(Object.values(items)),
    reasoning,
  };
}

function toQualEvaluationReport(
  judgeInput: ConversationJudgeInput,
  parsed: QualitativeJudgeResponse,
  judgeModel: string,
): QualEvaluationReport {
  const rubrics: Record<QualRubricKey, QualRubricDetailScore> = {
    A_ELICITATION_EFFICIENCY: buildDetailScore(
      {
        slot_targeting: parsed.rubric_a_elicitation_efficiency.slot_targeting,
        information_density:
          parsed.rubric_a_elicitation_efficiency.information_density,
        pacing: parsed.rubric_a_elicitation_efficiency.pacing,
        prioritization: parsed.rubric_a_elicitation_efficiency.prioritization,
      },
      parsed.rubric_a_elicitation_efficiency.reasoning,
    ),
    B_NON_REDUNDANCY: buildDetailScore(
      {
        memory_consistency: parsed.rubric_b_non_redundancy.memory_consistency,
        paraphrase_detection:
          parsed.rubric_b_non_redundancy.paraphrase_detection,
        confirmation_discipline:
          parsed.rubric_b_non_redundancy.confirmation_discipline,
        slot_closure: parsed.rubric_b_non_redundancy.slot_closure,
      },
      parsed.rubric_b_non_redundancy.reasoning,
    ),
    C_LEGAL_ADVICE_AVOIDANCE: buildDetailScore(
      {
        outcome_prediction_refusal:
          parsed.rubric_c_legal_advice_avoidance.outcome_prediction_refusal,
        strategy_recommendation_refusal:
          parsed.rubric_c_legal_advice_avoidance
            .strategy_recommendation_refusal,
        statute_citation_restraint:
          parsed.rubric_c_legal_advice_avoidance.statute_citation_restraint,
        redirect_quality:
          parsed.rubric_c_legal_advice_avoidance.redirect_quality,
      },
      parsed.rubric_c_legal_advice_avoidance.reasoning,
    ),
    D_NATURALNESS: buildDetailScore(
      {
        tone_calibration: parsed.rubric_d_naturalness.tone_calibration,
        plain_language: parsed.rubric_d_naturalness.plain_language,
        brevity: parsed.rubric_d_naturalness.brevity,
        adaptability: parsed.rubric_d_naturalness.adaptability,
      },
      parsed.rubric_d_naturalness.reasoning,
    ),
    E_DIALOGUE_COHERENCE: buildDetailScore(
      {
        topic_continuity: parsed.rubric_e_dialogue_coherence.topic_continuity,
        bridging: parsed.rubric_e_dialogue_coherence.bridging,
        order_sensibility: parsed.rubric_e_dialogue_coherence.order_sensibility,
        closure: parsed.rubric_e_dialogue_coherence.closure,
      },
      parsed.rubric_e_dialogue_coherence.reasoning,
    ),
  };

  return {
    case_id: judgeInput.case_id,
    case_title: judgeInput.case_title,
    system: judgeInput.system,
    judge_model: judgeModel,
    ai_turns: judgeInput.ai_turn_deltas.length,
    overall_average_score: averageScores(
      Object.values(rubrics).map((rubric) => rubric.average),
    ),
    rubrics,
    evaluated_at: new Date().toISOString(),
  };
}

// ============================================================
// 메인 평가 함수
// ============================================================

export async function evaluateQualitativeResult(
  result: ExperimentResult,
  options?: { openai?: OpenAI; judgeModel?: string },
): Promise<QualEvaluationReport> {
  const client = options?.openai ?? new OpenAI();
  const judgeModel =
    options?.judgeModel ?? process.env.OPENAI_JUDGE_MODEL ?? "gpt-5-mini";
  const judgeInput = buildConversationJudgeInput(result);

  const response = await client.responses.parse({
    model: judgeModel,
    input: [
      { role: "system", content: QUAL_JUDGE_SYSTEM_PROMPT },
      { role: "user", content: buildJudgeUserPrompt(judgeInput) },
    ],
    text: {
      format: zodTextFormat(
        QualitativeJudgeResponseSchema,
        "qualitative_rubric_evaluation",
      ),
    },
  });

  if (!response.output_parsed) {
    throw new Error("Qualitative judge returned no parsed JSON output.");
  }

  return toQualEvaluationReport(judgeInput, response.output_parsed, judgeModel);
}

// ============================================================
// LangSmith Evaluator Adapter
// ============================================================

function addRubricLangSmithResults(
  results: LangSmithEvaluationResult[],
  report: QualEvaluationReport,
  rubricKey: QualRubricKey,
  keyPrefix: string,
  evaluatorInfo: Record<string, unknown>,
): void {
  const rubric = report.rubrics[rubricKey];

  for (const [itemKey, score] of Object.entries(rubric.items)) {
    results.push({
      key: `${keyPrefix}_${itemKey}`,
      score,
      comment: rubric.reasoning,
      evaluatorInfo,
    });
  }

  results.push({
    key: `${keyPrefix}_average`,
    score: rubric.average,
    comment: rubric.reasoning,
    evaluatorInfo,
  });
}

function toLangSmithResults(
  report: QualEvaluationReport,
): LangSmithEvaluationResult[] {
  const evaluatorInfo = {
    evaluator: "qualEvaluator",
    judge_model: report.judge_model,
    score_scale: "1=very poor, 10=very good",
    ai_turns: report.ai_turns,
  };
  const results: LangSmithEvaluationResult[] = [];

  addRubricLangSmithResults(
    results,
    report,
    "A_ELICITATION_EFFICIENCY",
    "qual_a",
    evaluatorInfo,
  );
  addRubricLangSmithResults(
    results,
    report,
    "B_NON_REDUNDANCY",
    "qual_b",
    evaluatorInfo,
  );
  addRubricLangSmithResults(
    results,
    report,
    "C_LEGAL_ADVICE_AVOIDANCE",
    "qual_c",
    evaluatorInfo,
  );
  addRubricLangSmithResults(
    results,
    report,
    "D_NATURALNESS",
    "qual_d",
    evaluatorInfo,
  );
  addRubricLangSmithResults(
    results,
    report,
    "E_DIALOGUE_COHERENCE",
    "qual_e",
    evaluatorInfo,
  );

  results.push({
    key: "qual_overall_average",
    score: report.overall_average_score,
    comment: `A=${report.rubrics.A_ELICITATION_EFFICIENCY.average}, B=${report.rubrics.B_NON_REDUNDANCY.average}, C=${report.rubrics.C_LEGAL_ADVICE_AVOIDANCE.average}, D=${report.rubrics.D_NATURALNESS.average}, E=${report.rubrics.E_DIALOGUE_COHERENCE.average}`,
    evaluatorInfo,
  });

  return results;
}

export async function qualEvaluator({
  outputs,
}: LangSmithEvaluatorArgs) {
  const result = outputs as unknown as ExperimentResult;
  const report = await evaluateQualitativeResult(result);

  return {
    results: toLangSmithResults(report),
  };
}

// ============================================================
// 결과 저장
// ============================================================

export function saveQualEvalReport(
  report: QualEvaluationReport,
  resultsDir: string = "eval/runner/results",
): string {
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  const timestamp = report.evaluated_at.replace(/[:.]/g, "-");
  const filename = `${report.case_id}-${report.system}-${timestamp}-qual-eval.json`;
  const filepath = path.join(resultsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2), "utf-8");
  return filepath;
}

// ============================================================
// 콘솔 출력 헬퍼
// ============================================================

const QUAL_RUBRIC_LABELS: Record<QualRubricKey, string> = {
  A_ELICITATION_EFFICIENCY: "A. Elicitation Efficiency",
  B_NON_REDUNDANCY: "B. Non-redundancy",
  C_LEGAL_ADVICE_AVOIDANCE: "C. Legal Advice Avoidance",
  D_NATURALNESS: "D. Naturalness",
  E_DIALOGUE_COHERENCE: "E. Dialogue Coherence",
};

export function printQualEvalSummary(report: QualEvaluationReport): void {
  console.log("\n=== Qualitative Evaluation Report ===");
  console.log(`Case:          ${report.case_id} - ${report.case_title}`);
  console.log(`System:        ${report.system}`);
  console.log(`Judge model:   ${report.judge_model}`);
  console.log(`AI turns:      ${report.ai_turns}`);
  console.log(`Overall avg:   ${report.overall_average_score.toFixed(2)}`);
  console.log("\nRubric averages:");

  for (const [rubricKey, rubric] of Object.entries(report.rubrics) as [
    QualRubricKey,
    QualRubricDetailScore,
  ][]) {
    console.log(
      `  ${QUAL_RUBRIC_LABELS[rubricKey]}: ${rubric.average.toFixed(2)} - ${rubric.reasoning}`,
    );
  }

  // LangSmith 결과 개수 sanity check (26 예상: 세부 20 + rubric 평균 5 + overall 1)
  const langSmithResultCount = toLangSmithResults(report).length;
  console.log(`\nLangSmith results: ${langSmithResultCount} (expected: 26)`);
  console.log("=====================================\n");
}

// ============================================================
// CLI Entry Point
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error(
      "Usage: npx tsx eval/runner/evaluators/qual_evaluator.ts <result_json_path>",
    );
    console.error(
      "  example: npx tsx eval/runner/evaluators/qual_evaluator.ts eval/runner/results/IA-CASE-002-ia-2026...json",
    );
    process.exit(1);
  }

  const resultPath = args[0];
  if (!fs.existsSync(resultPath)) {
    console.error(`Result file not found: ${resultPath}`);
    process.exit(1);
  }

  const result = JSON.parse(
    fs.readFileSync(resultPath, "utf-8"),
  ) as ExperimentResult;
  const report = await evaluateQualitativeResult(result);
  const saved = saveQualEvalReport(report);

  printQualEvalSummary(report);
  console.log(`Qual eval report saved to: ${saved}\n`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Qual eval error:", err);
    process.exit(1);
  });
}
