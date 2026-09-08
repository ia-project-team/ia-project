-- Vercel 같은 서버리스 환경에서도 상담 대화 상태를 이어가기 위한 저장소.
create table if not exists chat_sessions (
  session_id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table chat_sessions enable row level security;

create index if not exists chat_sessions_user_id_idx
  on chat_sessions (user_id)
  where user_id is not null;

-- 이 테이블은 서버의 service-role 클라이언트로만 접근한다.
revoke all on table chat_sessions from anon, authenticated;
