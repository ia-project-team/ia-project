import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { Client } from "langsmith";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const CASES_DIR = path.resolve(process.cwd(), "eval/golden-set/cases");
const files = fs.readdirSync(CASES_DIR).filter((f) => f.endsWith(".md"));

// 변환
const examples: {
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  metadata: Record<string, unknown>;
}[] = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(CASES_DIR, file), "utf-8");

  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) continue;

  const frontmatter = yaml.load(match[1]) as Record<string, unknown>;

  examples.push({
    inputs: {
      first_utterance: frontmatter.first_utterance,
      persona: frontmatter.persona,
      simulator_context: frontmatter.simulator,
    },
    outputs: {
      ground_truth: frontmatter.ground_truth,
    },
    metadata: {
      case_id: frontmatter.case_id,
      case_title: frontmatter.case_title,
      difficulty: frontmatter.difficulty,
      client_type: frontmatter.client_type,
    },
  });
}

// 업로드
async function main() {
  const client = new Client();
  const DATASET_NAME = process.env.LANGSMITH_DATASET_NAME ?? "ia-golden-set";

  let dataset;
  try {
    dataset = await client.readDataset({ datasetName: DATASET_NAME });
    console.log(`기존 Dataset 사용: ${DATASET_NAME}`);
  } catch {
    dataset = await client.createDataset(DATASET_NAME);
    console.log(`새 Dataset 생성: ${DATASET_NAME}`);
  }

  for (const example of examples) {
    await client.createExample(
      example.inputs,
      example.outputs,
      { datasetId: dataset.id, metadata: example.metadata }
    );
    console.log(`✅ ${example.metadata.case_id} 업로드 완료`);
  }

  console.log(`\n총 ${examples.length}개 업로드 완료`);
}

main().catch(console.error);