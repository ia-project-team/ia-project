import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { selectRagCandidates } from "@/core/rag/retrievalPolicy";
import { detectApplicabilityGates } from "@/core/rag/retrievalText";
import type { RetrievedCase } from "@/core/rag/types";

type TriggerRecord = {
  record_id: string;
  dataset: string;
  source_row: number;
  legal_category: string;
  issue: string | null;
  service_fit: RetrievedCase["serviceFit"];
  question: string;
  answer: string | null;
  answer_status: RetrievedCase["answerStatus"];
  decision_reason: string | null;
  record_type: string;
  applicability_gate: string[];
  user_signal: string[];
  target_fact: string;
  why_material: string;
};

type EvalPair = {
  triggerId: string;
  positiveInput: string;
  negativeInput: string;
};

const root = process.cwd();
const triggers = readFileSync(
  path.join(root, "data/rag/deduplicated/question_triggers.jsonl"),
  "utf8",
).trim().split(/\r?\n/u).map((line) => JSON.parse(line) as TriggerRecord);
const pairs = (JSON.parse(readFileSync(
  path.join(root, "data/rag/eval/trigger-pair-cases.json"),
  "utf8",
)) as { pairs: EvalPair[] }).pairs;

function triggerCases(input: string): RetrievedCase[] {
  const detected = detectApplicabilityGates(input);
  return triggers.map((trigger) => ({
    id: trigger.record_id,
    dataset: trigger.dataset,
    sourceRow: trigger.source_row,
    legalCategory: trigger.legal_category,
    issue: trigger.issue,
    serviceFit: trigger.service_fit,
    question: trigger.question,
    answer: trigger.answer,
    answerStatus: trigger.answer_status,
    decisionReason: trigger.decision_reason,
    score: 0,
    recordType: trigger.record_type,
    applicabilityGate: trigger.applicability_gate,
    matchedGates: trigger.applicability_gate.filter((gate) => detected.includes(gate)),
    userSignals: trigger.user_signal,
    targetFact: trigger.target_fact,
    whyMaterial: trigger.why_material,
  }));
}

describe("22개 RAG 질문 트리거 회귀 검증", () => {
  it("조건 충족 문장에서는 해당 트리거 22개를 모두 후보로 보존한다", () => {
    const missing = pairs.filter((pair) =>
      !selectRagCandidates(triggerCases(pair.positiveInput)).cases.some(
        (caseItem) => caseItem.id === pair.triggerId,
      )
    );

    expect(missing).toEqual([]);
  });

  it("조건이 부족한 22개 문장에서는 어떤 질문 트리거도 통과시키지 않는다", () => {
    const leaks = pairs.flatMap((pair) =>
      selectRagCandidates(triggerCases(pair.negativeInput)).cases
        .filter((caseItem) => caseItem.recordType === "question_trigger")
        .map((caseItem) => ({ scenario: pair.triggerId, selected: caseItem.id }))
    );

    expect(leaks).toEqual([]);
  });
});
