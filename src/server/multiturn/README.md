# 멀티턴 상담 엔진

임대차/전세사기 상담 인테이크를 위한 멀티턴 대화 엔진입니다.
**대화의 진행·판단·완성을 AI가 주도하고, 서버는 대화 기록을 보관·전달하는 역할**을 맡습니다.

## 설계 개념

상담을 진행하는 "역할" 자체를 AI에게 부여하는 구조입니다. 다음에 무엇을 물을지,
사용자의 답이 충분한지, 언제 상담을 마무리할지를 모두 AI가 대화 맥락에 근거해
스스로 판단합니다. 서버는 이 판단에 개입하지 않고, 대화가 이어지도록 기록을
보관하고 매 턴 AI에게 전달합니다.

따라서 이 엔진의 지능은 코드가 아니라 **프롬프트(역할 지시)**에 담깁니다.
상담 품질을 높이는 작업 = 프롬프트를 정교하게 다듬는 작업입니다.

## 역할 분담

- **서버**: 대화 기록(history)을 보관하고, 매 턴 AI에게 전체를 전달
- **AI**: 다음 질문 결정 · 답변 판정 · 꼬리 질문 · 완성 선언까지 주도

OpenAI의 Conversations API나 previous_response_id는 사용하지 않습니다.
대화 상태는 우리 서버가 직접 보관하고, 매 턴 `store: false`로 기록 전체를
전달하여 OpenAI 측에 상태를 남기지 않습니다.

## 디렉토리 구조
src/
├─ app/api/chat/route.ts          # API 진입점 (요청 수신 → 위임 → 응답)
└─ server/multiturn/
├─ index.ts                    # handleChat 진입점
├─ orchestrator/turnRunner.ts  # 한 턴 진행: 기록에 추가 → AI 호출 → 기록에 추가
├─ state/
│  ├─ checklist.ts             # 수집할 체크리스트 항목 정의
│  └─ sessionStore.ts          # 세션별 대화 기록 보관
├─ llm/
│  ├─ client.ts                # OpenAI Responses API 호출 (기록 전체 전달)
│  ├─ schemas.ts               # AI 출력 구조 정의 (Zod)
│  └─ prompts.ts               # 상담 역할·진행 지시 (엔진의 핵심)
├─ config.ts                   # 모델명 등 설정
└─ types.ts                    # 공용 타입

## 한 턴의 흐름
사용자 입력
→ route.ts          요청에서 sessionId, message 추출
→ index.ts          세션(대화 기록) 조회
→ turnRunner.ts     ① 사용자 발화를 기록에 추가
② AI 호출 (대화 기록 전체 전달)
③ AI 발화를 기록에 추가
→ client.ts         Responses API에 역할 지시 + 기록 전달, 구조화 응답 수신
→ 클라이언트 응답   { reply, phase, collected }
→ (다음 턴 반복: 쌓인 기록을 바탕으로 AI가 대화를 이어감)

## AI 응답 구조

매 턴 AI는 아래 세 가지를 함께 반환합니다.

- `reply`: 사용자에게 보여줄 다음 발화 (질문 또는 마무리 멘트)
- `collected`: 지금까지 확인된 체크리스트 항목들의 스냅샷
- `phase`: 대화 단계 (`collecting` / `ready_to_advise` / `done`)

## 사용 예시

```ts
const res = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sessionId: "user-123", message: "전세 상담받고 싶어요" }),
});
const result = await res.json();
// result.reply  → AI의 다음 발화
// result.phase  → 현재 대화 단계
// result.collected → 지금까지 수집된 항목
```

> 요청은 `message` 필드로 사용자 입력을 보내고, 응답은 `reply` 필드로 AI 발화를 받습니다.

## 설정
OPENAI_API_KEY=sk-...
MULTITURN_MODEL=gpt-5.2   # 선택, 모델 확정 후 교체

필요 패키지: `npm install openai zod`

## 참고

- 가장 자주 수정하게 될 파일은 `llm/prompts.ts`입니다. 실제 대화를 돌려보며
  역할 지시를 다듬는 것이 핵심 작업입니다.
- 도메인을 바꾸려면 `state/checklist.ts`의 항목 정의와 `llm/prompts.ts`의
  역할 지시만 교체하면 됩니다.
- 세션 저장소는 현재 인메모리 방식이라, 서버리스 환경에 배포할 때는
  Redis 등 외부 저장소로 교체가 필요합니다.