// RAG 타입 정의 — 순수 타입, 외부 의존 없음.

/** 검색 결과 한 건 (match_rag_documents 반환 행과 일치). */
export interface RetrievedChunk {
  topic: string;
  content: string;
  score: number; // 코사인 유사도 (1에 가까울수록 관련)
}