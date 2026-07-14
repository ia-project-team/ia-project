/**
 * LangSmith Experiment Result Exporter - 실험 결과 마크다운 추출 스크립트
 *
 * 목적:
 *   LangSmith에 저장된 IA/GPT/Claude 평가 실험 결과를 읽어 공유용 마크다운 표로 변환한다.
 *   새 실험을 실행하거나 LangSmith 서버에 데이터를 쓰지 않는다.
 *
 * 입력:
 *   - --experiments=ia-eval-...,gpt-eval-...,claude-eval-...
 *   - 또는 --dataset=ia-golden-set-dryrun
 *   - 선택: --output=docs/eval-design/05_experiment-1-result.md
 *
 * 출력:
 *   - --output 지정 시 해당 마크다운 파일
 *   - --output 미지정 시 stdout
 *
 * 사용:
 *   npx tsx eval/runner/scripts/export_results.ts \
 *     --experiments=ia-eval-d5fa4c69,gpt-eval-b07ff505,claude-eval-9c692daf \
 *     --output=docs/eval-design/05_experiment-3-result.md
 *
 *   npx tsx eval/runner/scripts/export_results.ts \
 *     --dataset=ia-golden-set-dryrun \
 *     --output=docs/eval-design/05_experiment-1-result.md
 */

import fs from "fs";
import path from "path";

import { loadEnvConfig } from "@next/env";
import { Client, type Dataset, type Run } from "langsmith";

loadEnvConfig(process.cwd());

// ============================================================
// Types
// ============================================================

const SYSTEMS = [
  { id: "IA", prefix: "ia-eval-" },
  { id: "GPT", prefix: "gpt-eval-" },
  { id: "Claude", prefix: "claude-eval-" },
] as const;

type SystemId = (typeof SYSTEMS)[number]["id"];
type Project = Awaited<ReturnType<Client["readProject"]>>;

interface CliArgs {
  experiments?: string[];
  dataset?: string;
  output?: string;
  help: boolean;
}

interface ExperimentRef {
  name: string;
  system: SystemId;
  project?: Project;
}

interface RunScore {
  caseId: string;
  scores: MetricScores;
}

interface ExperimentData {
  name: string;
  system: SystemId;
  project: Project;
  runs: RunScore[];
  feedbacklessRunCount: number;
}

type MetricScores = Partial<Record<MetricKey, number>>;

type MetricKey =
  | "recall"
  | "qual_a_slot_targeting"
  | "qual_a_information_density"
  | "qual_a_pacing"
  | "qual_a_prioritization"
  | "qual_a_average"
  | "qual_b_memory_consistency"
  | "qual_b_paraphrase_detection"
  | "qual_b_confirmation_discipline"
  | "qual_b_slot_closure"
  | "qual_b_average"
  | "qual_c_outcome_prediction_refusal"
  | "qual_c_strategy_recommendation_refusal"
  | "qual_c_statute_citation_restraint"
  | "qual_c_redirect_quality"
  | "qual_c_average"
  | "qual_d_tone_calibration"
  | "qual_d_plain_language"
  | "qual_d_brevity"
  | "qual_d_adaptability"
  | "qual_d_average"
  | "qual_e_topic_continuity"
  | "qual_e_bridging"
  | "qual_e_order_sensibility"
  | "qual_e_closure"
  | "qual_e_average"
  | "qual_overall_average";

// ============================================================
// Metric definitions
// ============================================================

const SUMMARY_METRICS: { label: string; key: MetricKey }[] = [
  { label: "recall", key: "recall" },
  { label: "qual_a_average", key: "qual_a_average" },
  { label: "qual_b_average", key: "qual_b_average" },
  { label: "qual_c_average", key: "qual_c_average" },
  { label: "qual_d_average", key: "qual_d_average" },
  { label: "qual_e_average", key: "qual_e_average" },
  { label: "qual_overall_average", key: "qual_overall_average" },
];

const DETAIL_TABLES: {
  title: string;
  rows: { label: string; key: MetricKey }[];
}[] = [
  {
    title: "표 2 — Rubric A 세부 항목 (질문 효율)",
    rows: [
      { label: "slot_targeting", key: "qual_a_slot_targeting" },
      { label: "information_density", key: "qual_a_information_density" },
      { label: "pacing", key: "qual_a_pacing" },
      { label: "prioritization", key: "qual_a_prioritization" },
    ],
  },
  {
    title: "표 3 — Rubric B 세부 항목 (반복 회피)",
    rows: [
      { label: "memory_consistency", key: "qual_b_memory_consistency" },
      { label: "paraphrase_detection", key: "qual_b_paraphrase_detection" },
      { label: "confirmation_discipline", key: "qual_b_confirmation_discipline" },
      { label: "slot_closure", key: "qual_b_slot_closure" },
    ],
  },
  {
    title: "표 4 — Rubric C 세부 항목 (법률 자문 회피)",
    rows: [
      {
        label: "outcome_prediction_refusal",
        key: "qual_c_outcome_prediction_refusal",
      },
      {
        label: "strategy_recommendation_refusal",
        key: "qual_c_strategy_recommendation_refusal",
      },
      {
        label: "statute_citation_restraint",
        key: "qual_c_statute_citation_restraint",
      },
      { label: "redirect_quality", key: "qual_c_redirect_quality" },
    ],
  },
  {
    title: "표 5 — Rubric D 세부 항목 (자연스러움)",
    rows: [
      { label: "tone_calibration", key: "qual_d_tone_calibration" },
      { label: "plain_language", key: "qual_d_plain_language" },
      { label: "brevity", key: "qual_d_brevity" },
      { label: "adaptability", key: "qual_d_adaptability" },
    ],
  },
  {
    title: "표 6 — Rubric E 세부 항목 (대화 일관성)",
    rows: [
      { label: "topic_continuity", key: "qual_e_topic_continuity" },
      { label: "bridging", key: "qual_e_bridging" },
      { label: "order_sensibility", key: "qual_e_order_sensibility" },
      { label: "closure", key: "qual_e_closure" },
    ],
  },
];

const ALL_METRIC_KEYS: MetricKey[] = [
  ...SUMMARY_METRICS.map((metric) => metric.key),
  ...DETAIL_TABLES.flatMap((table) => table.rows.map((row) => row.key)),
];

const USAGE = `Usage:
  npx tsx eval/runner/scripts/export_results.ts \\
    --experiments=ia-eval-...,gpt-eval-...,claude-eval-... \\
    --output=docs/eval-design/05_experiment-1-result.md

  npx tsx eval/runner/scripts/export_results.ts \\
    --dataset=ia-golden-set-dryrun \\
    --output=docs/eval-design/05_experiment-1-result.md

Options:
  --experiments  Comma-separated LangSmith experiment names.
  --dataset      Dataset name. Selects the latest ia-eval-*, gpt-eval-*,
                 and claude-eval-* experiment for that dataset.
  --output       Markdown output path. Prints to stdout when omitted.
  --help, -h     Show this message.`;

// ============================================================
// CLI
// ============================================================

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { help: false };

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }

    if (arg.startsWith("--experiments=")) {
      const value = arg.slice("--experiments=".length).trim();
      args.experiments = value
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
      continue;
    }

    if (arg.startsWith("--dataset=")) {
      args.dataset = arg.slice("--dataset=".length).trim();
      continue;
    }

    if (arg.startsWith("--output=")) {
      args.output = arg.slice("--output=".length).trim();
      continue;
    }

    throw new Error(`Unknown argument: ${arg}\n\n${USAGE}`);
  }

  return args;
}

function shouldPrintUsage(args: CliArgs): boolean {
  return args.help || (!args.experiments?.length && !args.dataset);
}

// ============================================================
// LangSmith loading
// ============================================================

async function resolveExperimentRefs(
  client: Client,
  args: CliArgs,
): Promise<ExperimentRef[]> {
  if (args.experiments?.length) {
    return args.experiments.map((name) => {
      const system = inferSystemFromExperimentName(name);
      if (!system) {
        throw new Error(`Unknown experiment prefix for "${name}".`);
      }
      return { name, system };
    });
  }

  if (!args.dataset) {
    throw new Error("Missing --experiments or --dataset.");
  }

  const projects: Project[] = [];
  for await (const project of client.listProjects({
    referenceDatasetName: args.dataset,
    includeStats: true,
  })) {
    if (project.name && inferSystemFromExperimentName(project.name, false)) {
      projects.push(project);
    }
  }

  return SYSTEMS.map((system) => {
    const selected = projects
      .filter((project) => project.name?.startsWith(system.prefix))
      .sort(compareProjectsByRecencyDesc)[0];

    if (!selected?.name) {
      throw new Error(
        `No LangSmith experiment found for dataset "${args.dataset}" with prefix "${system.prefix}".`,
      );
    }

    return {
      name: selected.name,
      system: system.id,
      project: selected,
    };
  });
}

async function loadExperimentData(
  client: Client,
  ref: ExperimentRef,
): Promise<ExperimentData | null> {
  const project = ref.project ?? (await readProjectByName(client, ref.name));
  const runs: RunScore[] = [];
  let feedbacklessRunCount = 0;

  for await (const run of client.listRuns({ projectName: ref.name })) {
    const scores = extractScores(run);
    if (Object.keys(scores).length === 0) {
      feedbacklessRunCount++;
      continue;
    }

    const caseId = extractCaseId(run);
    if (!caseId) {
      feedbacklessRunCount++;
      continue;
    }

    runs.push({ caseId, scores });
  }

  if (runs.length === 0) {
    console.warn(
      `[warning] ${ref.name}: feedback_stats가 비어 있거나 case_id를 찾지 못해 실험을 스킵합니다.`,
    );
    return null;
  }

  if (feedbacklessRunCount > 0) {
    console.warn(
      `[warning] ${ref.name}: 점수 또는 case_id가 없는 run ${feedbacklessRunCount}개를 제외했습니다.`,
    );
  }

  return {
    name: ref.name,
    system: ref.system,
    project,
    runs,
    feedbacklessRunCount,
  };
}

async function readProjectByName(client: Client, projectName: string): Promise<Project> {
  try {
    return await client.readProject({ projectName, includeStats: true });
  } catch (error) {
    throw new Error(
      `LangSmith experiment not found: ${projectName}\n${formatError(error)}`,
    );
  }
}

function inferSystemFromExperimentName(
  experimentName: string,
  throwOnUnknown = true,
): SystemId | null {
  const system = SYSTEMS.find((entry) => experimentName.startsWith(entry.prefix));
  if (system) return system.id;

  if (throwOnUnknown) {
    throw new Error(
      `Unknown experiment prefix for "${experimentName}". Expected ia-eval-*, gpt-eval-*, or claude-eval-*.`,
    );
  }

  return null;
}

function compareProjectsByRecencyDesc(a: Project, b: Project): number {
  return getProjectTime(b) - getProjectTime(a);
}

function getProjectTime(project: Project): number {
  const candidate = project.last_run_start_time ?? project.start_time ?? 0;
  return typeof candidate === "number" ? candidate : new Date(candidate).getTime();
}

// ============================================================
// Extraction helpers
// ============================================================

function extractScores(run: Run): MetricScores {
  const stats = isRecord(run.feedback_stats) ? run.feedback_stats : {};
  const scores: MetricScores = {};

  for (const key of ALL_METRIC_KEYS) {
    const value = extractFeedbackValue(stats[key]);
    if (value !== null) {
      scores[key] = value;
    }
  }

  return scores;
}

function extractFeedbackValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (!isRecord(value)) {
    return null;
  }

  for (const key of ["avg", "mean", "score", "value"]) {
    const candidate = value[key];
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
  }

  return null;
}

function extractCaseId(run: Run): string | null {
  const runRecord = run as unknown as Record<string, unknown>;
  const candidates = [
    getPath(run.inputs, ["case_id"]),
    getPath(run.outputs, ["case_id"]),
    getPath(run.outputs, ["output", "case_id"]),
    getPath(run.outputs, ["result", "case_id"]),
    getPath(run.extra, ["metadata", "case_id"]),
    getPath(runRecord, ["metadata", "case_id"]),
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getPath(value: unknown, keys: string[]): unknown {
  let current: unknown = value;
  for (const key of keys) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }
  return current;
}

// ============================================================
// Aggregation
// ============================================================

function buildCaseScoreMatrix(
  experiments: ExperimentData[],
): Map<SystemId, Map<string, MetricScores>> {
  const matrix = new Map<SystemId, Map<string, MetricScores>>();

  for (const system of SYSTEMS) {
    matrix.set(system.id, new Map());
  }

  for (const experiment of experiments) {
    const byCaseRuns = new Map<string, MetricScores[]>();
    for (const run of experiment.runs) {
      const existing = byCaseRuns.get(run.caseId) ?? [];
      existing.push(run.scores);
      byCaseRuns.set(run.caseId, existing);
    }

    const systemCases = matrix.get(experiment.system);
    if (!systemCases) continue;

    for (const [caseId, runScores] of byCaseRuns) {
      systemCases.set(caseId, averageMetricScores(runScores));
    }
  }

  return matrix;
}

function averageMetricScores(scoresList: MetricScores[]): MetricScores {
  const averaged: MetricScores = {};

  for (const key of ALL_METRIC_KEYS) {
    const values = scoresList
      .map((scores) => scores[key])
      .filter((value): value is number => typeof value === "number");
    const value = average(values);
    if (value !== null) {
      averaged[key] = value;
    }
  }

  return averaged;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getSystemMetricAverage(
  matrix: Map<SystemId, Map<string, MetricScores>>,
  system: SystemId,
  metric: MetricKey,
): number | null {
  const caseScores = matrix.get(system);
  if (!caseScores) return null;

  const values = Array.from(caseScores.values())
    .map((scores) => scores[metric])
    .filter((value): value is number => typeof value === "number");

  return average(values);
}

function getCaseMetricAverage(
  matrix: Map<SystemId, Map<string, MetricScores>>,
  system: SystemId,
  caseId: string,
  metric: MetricKey,
): number | null {
  const value = matrix.get(system)?.get(caseId)?.[metric];
  return typeof value === "number" ? value : null;
}

function getSortedCaseIds(
  matrix: Map<SystemId, Map<string, MetricScores>>,
): string[] {
  const caseIds = new Set<string>();

  for (const systemCases of matrix.values()) {
    for (const caseId of systemCases.keys()) {
      caseIds.add(caseId);
    }
  }

  return Array.from(caseIds).sort((a, b) =>
    a.localeCompare(b, "en", { numeric: true }),
  );
}

// ============================================================
// Markdown rendering
// ============================================================

async function renderMarkdown(
  client: Client,
  args: CliArgs,
  experiments: ExperimentData[],
): Promise<string> {
  const matrix = buildCaseScoreMatrix(experiments);
  const lines: string[] = [];
  const generatedAt = new Date().toISOString();
  const datasetLabel = await resolveDatasetLabel(client, args, experiments);
  const numRepetitions = inferNumRepetitions(experiments);
  const totalRuns = experiments.reduce((sum, experiment) => sum + experiment.runs.length, 0);

  lines.push("# 실험 결과 리포트");
  lines.push("");
  lines.push(`**생성 시각**: ${generatedAt}`);
  lines.push(`**Dataset**: ${datasetLabel}`);
  lines.push("**실험 목록**:");
  lines.push(...renderExperimentList(experiments));
  lines.push("");
  lines.push(`**Judge 모델**: ${process.env.OPENAI_JUDGE_MODEL ?? "gpt-5-mini"}`);
  lines.push(`**반복 실행**: ${formatOptionalNumber(numRepetitions)}회 (numRepetitions)`);
  lines.push(`**총 대화 수**: ${totalRuns}`);
  lines.push("");

  lines.push("## 표 1 — 전체 시스템 비교 요약 (핵심)");
  lines.push("");
  lines.push(renderMetricTable("Metric", SUMMARY_METRICS, (system, metric) =>
    getSystemMetricAverage(matrix, system, metric),
  ));
  lines.push("");

  for (const table of DETAIL_TABLES) {
    lines.push(`## ${table.title}`);
    lines.push("");
    lines.push(renderMetricTable("Detail", table.rows, (system, metric) =>
      getSystemMetricAverage(matrix, system, metric),
    ));
    lines.push("");
  }

  lines.push("## 표 7 — 케이스별 recall 상세");
  lines.push("");
  lines.push(renderCaseMetricTable(matrix, "recall"));
  lines.push("");

  lines.push("## 표 8 — 케이스별 qual_overall_average");
  lines.push("");
  lines.push(renderCaseMetricTable(matrix, "qual_overall_average"));
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function renderExperimentList(experiments: ExperimentData[]): string[] {
  const lines: string[] = [];

  for (const system of SYSTEMS) {
    const systemExperiments = experiments.filter(
      (experiment) => experiment.system === system.id,
    );

    if (systemExperiments.length === 0) {
      lines.push(`- ${system.id}: - (0 runs)`);
      continue;
    }

    for (const experiment of systemExperiments) {
      lines.push(`- ${system.id}: ${experiment.name} (${experiment.runs.length} runs)`);
    }
  }

  return lines;
}

function renderMetricTable(
  firstColumnName: string,
  rows: { label: string; key: MetricKey }[],
  getValue: (system: SystemId, metric: MetricKey) => number | null,
): string {
  const lines = [
    `| ${firstColumnName} | IA | GPT | Claude |`,
    "|---|---|---|---|",
  ];

  for (const row of rows) {
    lines.push(
      `| ${escapeMarkdownCell(row.label)} | ${SYSTEMS.map((system) =>
        formatNumber(getValue(system.id, row.key)),
      ).join(" | ")} |`,
    );
  }

  return lines.join("\n");
}

function renderCaseMetricTable(
  matrix: Map<SystemId, Map<string, MetricScores>>,
  metric: MetricKey,
): string {
  const lines = ["| Case | IA | GPT | Claude |", "|---|---|---|---|"];

  for (const caseId of getSortedCaseIds(matrix)) {
    lines.push(
      `| ${escapeMarkdownCell(caseId)} | ${SYSTEMS.map((system) =>
        formatNumber(getCaseMetricAverage(matrix, system.id, caseId, metric)),
      ).join(" | ")} |`,
    );
  }

  return lines.join("\n");
}

async function resolveDatasetLabel(
  client: Client,
  args: CliArgs,
  experiments: ExperimentData[],
): Promise<string> {
  if (args.dataset) return args.dataset;

  const datasetIds = Array.from(
    new Set(
      experiments
        .map((experiment) => experiment.project.reference_dataset_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  );

  if (datasetIds.length !== 1) {
    return "(direct experiments)";
  }

  try {
    for await (const dataset of client.listDatasets({ datasetIds })) {
      return formatDataset(dataset);
    }
  } catch {
    return `reference_dataset_id=${datasetIds[0]}`;
  }

  return `reference_dataset_id=${datasetIds[0]}`;
}

function formatDataset(dataset: Dataset): string {
  return dataset.name;
}

function inferNumRepetitions(experiments: ExperimentData[]): number | null {
  const explicit = experiments
    .map((experiment) => readNumRepetitions(experiment.project))
    .find((value): value is number => typeof value === "number");

  if (explicit) return explicit;

  const inferred = experiments
    .map((experiment) => {
      const caseCount = new Set(experiment.runs.map((run) => run.caseId)).size;
      if (caseCount === 0) return null;
      const ratio = experiment.runs.length / caseCount;
      return Number.isInteger(ratio) ? ratio : null;
    })
    .filter((value): value is number => typeof value === "number");

  if (inferred.length === 0) return null;
  const first = inferred[0];
  return inferred.every((value) => value === first) ? first : null;
}

function readNumRepetitions(project: Project): number | null {
  const projectRecord = project as unknown as Record<string, unknown>;
  const candidates = [
    projectRecord.num_repetitions,
    projectRecord.numRepetitions,
    getPath(project.extra, ["metadata", "num_repetitions"]),
    getPath(project.extra, ["num_repetitions"]),
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
  }

  return null;
}

function formatNumber(value: number | null): string {
  if (value === null) return "-";
  return value.toFixed(2);
}

function formatOptionalNumber(value: number | null): string {
  return value === null ? "알 수 없음" : String(value);
}

function escapeMarkdownCell(value: string): string {
  return value.replace(/\|/g, "\\|");
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  return String(error);
}

// ============================================================
// Main
// ============================================================

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (shouldPrintUsage(args)) {
    console.log(USAGE);
    return;
  }

  const client = new Client();
  const refs = await resolveExperimentRefs(client, args);
  const experiments: ExperimentData[] = [];

  for (const ref of refs) {
    const data = await loadExperimentData(client, ref);
    if (data) {
      experiments.push(data);
    }
  }

  if (experiments.length === 0) {
    throw new Error("No completed LangSmith experiments with feedback_stats found.");
  }

  const markdown = await renderMarkdown(client, args, experiments);

  if (args.output) {
    const outputPath = path.resolve(process.cwd(), args.output);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, markdown, "utf-8");
    console.error(`Markdown report written: ${outputPath}`);
    return;
  }

  process.stdout.write(markdown);
}

main().catch((error: unknown) => {
  console.error(formatError(error));
  process.exitCode = 1;
});
