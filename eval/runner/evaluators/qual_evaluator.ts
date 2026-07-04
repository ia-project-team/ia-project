/**
 * Qualitative LLM-as-Judge evaluator for IA follow-up questions.
 * Scores each experiment on rubric A-E and returns per-rubric scores plus an average.
 */

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import {
  RUBRIC_A_CASE_RELEVANCE,
  RUBRIC_B_INFO_COLLECTION,
  RUBRIC_C_NON_DUPLICATION,
  RUBRIC_D_LEGAL_ADVICE_AVOIDANCE,
  RUBRIC_E_EXPRESSION_CLARITY,
} from "../prompts/rubric";
import type { CollectedItem, Phase } from "../ia";
import type { ConversationTurn, ExperimentResult } from "../runExperiment";

// ============================================================
// Types and Schema
// ============================================================

const RubricScoreSchema = z
  .object({
    score: z.number().int().min(1).max(5),
    reasoning: z.string().min(1),
  })
  .strict();

const QualitativeJudgeResponseSchema = z
  .object({
    rubric_a_case_relevance: RubricScoreSchema,
    rubric_b_info_collection: RubricScoreSchema,
    rubric_c_non_duplication: RubricScoreSchema,
    rubric_d_legal_advice_avoidance: RubricScoreSchema,
    rubric_e_expression_clarity: RubricScoreSchema,
    average_score: z.number().min(1).max(5),
  })
  .strict();

type QualitativeJudgeResponse = z.infer<typeof QualitativeJudgeResponseSchema>;

export type QualRubricKey =
  | "A_CASE_RELEVANCE"
  | "B_INFO_COLLECTION"
  | "C_NON_DUPLICATION"
  | "D_LEGAL_ADVICE_AVOIDANCE"
  | "E_EXPRESSION_CLARITY";

export interface QualRubricScore {
  score: number;
  reasoning: string;
}

export interface QualEvaluationReport {
  case_id: string;
  case_title: string;
  system: string;
  judge_model: string;
  ai_turns: number;
  average_score: number;
  rubrics: Record<QualRubricKey, QualRubricScore>;
  evaluated_at: string;
}

interface AiTurnJudgeInput {
  turn: number;
  prior_history: string;
  ai_next_question: string;
  collected_slots: CollectedItem[];
  phase: Phase | null;
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
// Prompt Construction
// ============================================================

const QUAL_JUDGE_SYSTEM_PROMPT = `당신은 전세 보증금 반환 분쟁 intake assistant를 평가하는 독립 judge입니다.
각 AI turn의 후속 질문/응답을 직전 대화 history와 그 시점의 collected 슬롯 상태에 비추어 평가하세요.

채점 원칙:
- 점수는 반드시 integer 1~5입니다. 1=매우 부적합, 5=매우 적합입니다.
- reasoning은 각 rubric별 한 줄 근거로 작성합니다.
- 중복 여부는 collected_slots뿐 아니라 prior_history에서 이미 답한 내용까지 함께 봅니다.
- 법률 자문 회피는 승소 가능성, 법적 판단, 구체적 대응 방법 제시 여부를 엄격히 봅니다.
- 반드시 strict JSON만 반환하고, JSON 밖의 설명 문장은 쓰지 마세요.

Rubrics:
${RUBRIC_A_CASE_RELEVANCE}

${RUBRIC_B_INFO_COLLECTION}

${RUBRIC_C_NON_DUPLICATION}

${RUBRIC_D_LEGAL_ADVICE_AVOIDANCE}

${RUBRIC_E_EXPRESSION_CLARITY}

최종 JSON은 다음 키만 포함해야 합니다:
{
  "rubric_a_case_relevance": { "score": 1~5 integer, "reasoning": "한 줄 근거" },
  "rubric_b_info_collection": { "score": 1~5 integer, "reasoning": "한 줄 근거" },
  "rubric_c_non_duplication": { "score": 1~5 integer, "reasoning": "한 줄 근거" },
  "rubric_d_legal_advice_avoidance": { "score": 1~5 integer, "reasoning": "한 줄 근거" },
  "rubric_e_expression_clarity": { "score": 1~5 integer, "reasoning": "한 줄 근거" },
  "average_score": 1~5 number
}`;

function formatConversationLine(turn: ConversationTurn): string {
  const speaker = turn.speaker === "client" ? "의뢰인" : "AI";
  return `[turn=${turn.turn} ${speaker}] ${turn.content}`;
}

function buildAiTurnInputs(
  conversation: ExperimentResult["conversation"],
): AiTurnJudgeInput[] {
  const aiTurns: AiTurnJudgeInput[] = [];

  for (let i = 0; i < conversation.length; i++) {
    const turn = conversation[i];
    if (turn.speaker !== "ai") continue;

    const priorHistory = conversation
      .slice(0, i)
      .map(formatConversationLine)
      .join("\n");

    aiTurns.push({
      turn: turn.turn,
      prior_history: priorHistory,
      ai_next_question: turn.content,
      collected_slots: turn.collected_snapshot ?? [],
      phase: turn.phase_snapshot ?? null,
    });
  }

  return aiTurns;
}

function buildJudgeUserPrompt(result: ExperimentResult): string {
  const judgeInput = {
    case_id: result.case_id,
    case_title: result.case_title,
    system: result.system,
    ai_turns: buildAiTurnInputs(result.conversation),
  };

  return `아래 JSON 입력을 기준으로 rubric A~E를 종합 채점하세요.
각 ai_turns 항목은 "prior_history + ai_next_question + collected_slots" 단위의 평가 입력입니다.
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

function toQualEvaluationReport(
  result: ExperimentResult,
  parsed: QualitativeJudgeResponse,
  judgeModel: string,
): QualEvaluationReport {
  const scores = [
    parsed.rubric_a_case_relevance.score,
    parsed.rubric_b_info_collection.score,
    parsed.rubric_c_non_duplication.score,
    parsed.rubric_d_legal_advice_avoidance.score,
    parsed.rubric_e_expression_clarity.score,
  ];

  return {
    case_id: result.case_id,
    case_title: result.case_title,
    system: result.system,
    judge_model: judgeModel,
    ai_turns: buildAiTurnInputs(result.conversation).length,
    average_score: averageScores(scores),
    rubrics: {
      A_CASE_RELEVANCE: parsed.rubric_a_case_relevance,
      B_INFO_COLLECTION: parsed.rubric_b_info_collection,
      C_NON_DUPLICATION: parsed.rubric_c_non_duplication,
      D_LEGAL_ADVICE_AVOIDANCE: parsed.rubric_d_legal_advice_avoidance,
      E_EXPRESSION_CLARITY: parsed.rubric_e_expression_clarity,
    },
    evaluated_at: new Date().toISOString(),
  };
}

export async function evaluateQualitativeResult(
  result: ExperimentResult,
  options?: { openai?: OpenAI; judgeModel?: string },
): Promise<QualEvaluationReport> {
  const client = options?.openai ?? new OpenAI();
  const judgeModel =
    options?.judgeModel ?? process.env.OPENAI_JUDGE_MODEL ?? "gpt-5-mini";

  const response = await client.responses.parse({
    model: judgeModel,
    input: [
      { role: "system", content: QUAL_JUDGE_SYSTEM_PROMPT },
      { role: "user", content: buildJudgeUserPrompt(result) },
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

  return toQualEvaluationReport(result, response.output_parsed, judgeModel);
}

// ============================================================
// LangSmith Evaluator Adapter
// ============================================================

function toLangSmithResults(
  report: QualEvaluationReport,
): LangSmithEvaluationResult[] {
  const evaluatorInfo = {
    evaluator: "qualEvaluator",
    judge_model: report.judge_model,
    score_scale: "1=very poor, 5=very good",
    ai_turns: report.ai_turns,
  };

  return [
    {
      key: "qual_rubric_a_case_relevance",
      score: report.rubrics.A_CASE_RELEVANCE.score,
      comment: report.rubrics.A_CASE_RELEVANCE.reasoning,
      evaluatorInfo,
    },
    {
      key: "qual_rubric_b_info_collection",
      score: report.rubrics.B_INFO_COLLECTION.score,
      comment: report.rubrics.B_INFO_COLLECTION.reasoning,
      evaluatorInfo,
    },
    {
      key: "qual_rubric_c_non_duplication",
      score: report.rubrics.C_NON_DUPLICATION.score,
      comment: report.rubrics.C_NON_DUPLICATION.reasoning,
      evaluatorInfo,
    },
    {
      key: "qual_rubric_d_legal_advice_avoidance",
      score: report.rubrics.D_LEGAL_ADVICE_AVOIDANCE.score,
      comment: report.rubrics.D_LEGAL_ADVICE_AVOIDANCE.reasoning,
      evaluatorInfo,
    },
    {
      key: "qual_rubric_e_expression_clarity",
      score: report.rubrics.E_EXPRESSION_CLARITY.score,
      comment: report.rubrics.E_EXPRESSION_CLARITY.reasoning,
      evaluatorInfo,
    },
    {
      key: "qual_average_score",
      score: report.average_score,
      comment: `A=${report.rubrics.A_CASE_RELEVANCE.score}, B=${report.rubrics.B_INFO_COLLECTION.score}, C=${report.rubrics.C_NON_DUPLICATION.score}, D=${report.rubrics.D_LEGAL_ADVICE_AVOIDANCE.score}, E=${report.rubrics.E_EXPRESSION_CLARITY.score}`,
      evaluatorInfo,
    },
  ];
}

export async function qualEvaluator({ outputs }: LangSmithEvaluatorArgs) {
  const result = outputs as unknown as ExperimentResult;
  const report = await evaluateQualitativeResult(result);

  return {
    results: toLangSmithResults(report),
  };
}
