# openai-oauth 로컬 개발 설정

공식 OpenAI API 키 없이 ChatGPT 계정으로 로컬 개발하는 방법입니다.

> **주의:** 비공식 커뮤니티 프로젝트입니다. 개인 개발/실험 용도로만 사용하세요.

## 1. Codex 로그인

Node.js가 설치되어 있어야 합니다.

```bash
npx @openai/codex login
```

브라우저가 열리면 ChatGPT 계정으로 로그인합니다.
성공하면 `~/.codex/auth.json`이 생성됩니다.

## 2. openai-oauth 실행

```bash
npx openai-oauth
```

실행되면 `http://127.0.0.1:10532/v1` 형태의 로컬 API 서버가 열립니다.

## 3. 지원 모델 확인

```bash
curl http://127.0.0.1:10532/v1/models
```

지원 모델 목록을 확인한 뒤, 목록에 있는 모델만 사용해야 합니다.
(`gpt-4o`, `gpt-5` 등은 지원되지 않을 수 있습니다.)

## 4. .env.local 설정

`.env.local.example`을 복사한 뒤 프록시 모드 값을 채워넣습니다.

```bash
cp .env.local.example .env.local
```

```env
OPENAI_API_KEY=dummy
OPENAI_BASE_URL=http://127.0.0.1:10532/v1
MULTITURN_MODEL=gpt-5.5
```

이후 `npm run dev`로 개발 서버를 실행하면 openai-oauth를 통해 OpenAI가 호출됩니다.
