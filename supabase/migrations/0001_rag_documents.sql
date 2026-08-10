-- RAG 상황 가이드 문서 저장소 + 유사도 검색 함수.
-- Supabase 대시보드 SQL Editor에서 실행함 (2026-07).
create extension if not exists vector;

create table if not exists rag_documents (
  id text primary key,              -- 파일명 기반 식별자 (예: 'auction')
  topic text not null,              -- 상황 이름
  keywords text[] not null default '{}',
  content text not null,            -- 왜 중요한가 + 확인 질문
  embedding vector(1536) not null   -- text-embedding-3-small 차원
);

-- 서버(secret 키)만 접근. 공개 키로는 읽기 불가.
alter table rag_documents enable row level security;

-- 코사인 유사도 검색. <=>는 코사인 거리, 1 - 거리 = 유사도.
create or replace function match_rag_documents(
  query_embedding vector(1536),
  match_count int default 3
)
returns table (topic text, content text, score float)
language sql stable
as $$
  select topic, content, 1 - (embedding <=> query_embedding) as score
  from rag_documents
  order by embedding <=> query_embedding
  limit match_count;
$$;