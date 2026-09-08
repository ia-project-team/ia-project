# LawPre

전세 보증금 반환 분쟁을 변호사 상담 전에 정리해 주는 대화형 서비스입니다.

## 로컬 실행

1. `.env.local.example`을 `.env.local`로 복사하고 필요한 값을 채웁니다.
2. `npm ci` 후 `npm run dev`를 실행합니다.
3. `http://localhost:3000`에서 확인합니다.

비회원은 AI 답변을 10회까지 무료로 받을 수 있습니다. 사용량은 서버가 서명한
HttpOnly 쿠키로 관리하며, 가입 또는 로그인 후에는 제한 없이 이어서 대화합니다.

## Supabase 준비

- `supabase/migrations/0001_rag_documents.sql`
- `supabase/migrations/0002_rag_cases.sql`
- `supabase/migrations/0003_chat_sessions.sql`

위 마이그레이션을 순서대로 적용합니다. `chat_sessions`는 서버리스 인스턴스가
바뀌어도 상담 맥락을 유지하기 위한 서버 전용 테이블입니다.

Authentication의 이메일 확인을 사용하는 경우 Site URL을 배포 주소로 설정하고,
Redirect URLs에 로컬 및 배포 주소의 `/auth/confirm` 경로를 추가합니다.

## Vercel 배포

이 프로젝트는 Next.js Route Handler와 Server Action을 사용하므로 Vercel에 그대로
배포할 수 있습니다. 배포 전에 다음 환경변수를 Vercel의 Production, Preview,
Development 환경에 설정합니다.

- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `GUEST_USAGE_SECRET` (32자 이상의 임의 문자열)
- `NEXT_PUBLIC_SITE_URL` (프로덕션 배포 주소)

배포 전 확인 명령은 `npm run check`입니다.
