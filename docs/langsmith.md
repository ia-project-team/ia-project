# LangSmith 평가 연결

Golden Set을 LangSmith Dataset으로 올리고, IA / GPT / Claude 를 같은 기준(recall)으로
평가·비교하는 방법입니다. 결과는 LangSmith 대시보드에서 확인합니다.

관련 코드
- 업로드: `eval/golden-set/scripts/convert_to_langsmith.ts`
- 실행:   `eval/runner/runLangsmith.ts`

## 1. API Key 발급

[smith.langchain.com](https://smith.langchain.com) 로그인 후
**Settings → API Keys** 에서 키를 발급합니다.

## 2. .env.local 설정

`.env.local` 의 LangSmith 섹션을 채웁니다.

```env
LANGCHAIN_API_KEY=ls__...        # 1번에서 발급한 키
LANGCHAIN_PROJECT=ia-eval        # Trace 가 기록될 프로젝트 이름 (자유롭게)
LANGSMITH_DATASET_NAME=ia-golden-set   # 데이터셋 이름 (기본값 그대로 두어도 됨)
```

> `langsmith` SDK 가 위 환경변수를 자동으로 읽습니다.
> 프로젝트는 없으면 첫 실행 때 자동 생성됩니다.

평가에는 아래 키들도 필요합니다 (같은 `.env.local` 안에 있음).
- `OPENAI_API_KEY` — IA · GPT · 시뮬레이터 · Judge
- `ANTHROPIC_API_KEY` — Claude baseline (runLangsmith 는 Claude 도 함께 실행)

## 3. Golden Set → Dataset 업로드

`eval/golden-set/cases/*.md` 의 frontmatter를 읽어 LangSmith Dataset으로 올립니다.

```bash
npx tsx eval/golden-set/scripts/convert_to_langsmith.ts
```

- `LANGSMITH_DATASET_NAME` 이름의 Dataset이 없으면 새로 만들고, 있으면 재사용합니다.
- 각 케이스가 하나의 Example(inputs=`case_id` 등, outputs=`ground_truth`)로 등록됩니다.

## 4. 평가 실행

IA 본체 서버를 먼저 띄워야 합니다 (IA runner가 `IA_API_URL` 로 호출).

```bash
npm run dev            # 터미널 1: localhost:3000
npx tsx eval/runner/runLangsmith.ts   # 터미널 2: 평가 실행
```

`runLangsmith.ts` 는 같은 Dataset에 대해 세 시스템을 순서대로 평가합니다.

| 시스템 | Experiment Prefix | 평가 지표 |
|--------|-------------------|-----------|
| IA     | `ia-eval`         | recall    |
| GPT    | `gpt-eval`        | recall    |
| Claude | `claude-eval`     | recall    |

## 5. 결과 확인

LangSmith 대시보드 → **Datasets & Experiments** 에서 `ia-golden-set` 을 열면
`ia-eval` / `gpt-eval` / `claude-eval` Experiment의 recall 점수를 나란히 비교할 수 있습니다.
