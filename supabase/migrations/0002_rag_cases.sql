-- 실제 법률상담 사례 RAG를 추가한다.
-- 다른 브랜치가 사용하는 예시 rag_documents / match_rag_documents는 병행 보존한다.

create extension if not exists vector;

create table if not exists rag_cases (
  id text primary key,
  dataset text not null,
  source_row integer not null,
  legal_category text not null,
  issue text,
  service_fit text not null check (service_fit in ('direct', 'conditional')),
  question text not null,
  answer text,
  statutes text,
  precedents text,
  decision_reason text,
  answer_status text not null check (answer_status in ('complete', 'missing')),
  source_metadata jsonb not null default '{}',
  embedding vector(1536) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dataset, source_row)
);

alter table rag_cases enable row level security;

create index if not exists rag_cases_embedding_hnsw_idx
  on rag_cases using hnsw (embedding vector_cosine_ops);

create or replace function set_rag_cases_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rag_cases_set_updated_at on rag_cases;

create trigger rag_cases_set_updated_at
before update on rag_cases
for each row
execute function set_rag_cases_updated_at();

create or replace function match_rag_cases(
  query_embedding vector(1536),
  match_count int default 8
)
returns table (
  id text,
  dataset text,
  source_row integer,
  legal_category text,
  issue text,
  service_fit text,
  question text,
  answer text,
  answer_status text,
  decision_reason text,
  score float
)
language sql stable
as $$
  select
    c.id,
    c.dataset,
    c.source_row,
    c.legal_category,
    c.issue,
    c.service_fit,
    c.question,
    c.answer,
    c.answer_status,
    c.decision_reason,
    1 - (c.embedding <=> query_embedding) as score
  from rag_cases c
  order by c.embedding <=> query_embedding
  limit greatest(match_count, 0);
$$;
