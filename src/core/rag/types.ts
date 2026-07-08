// RAG 타입·상수 정의 — 순수 모듈, 외부 의존 없음 (Next.js 밖 스크립트에서도 사용).

// 문서·쿼리 임베딩에 반드시 같은 모델을 써야 검색이 유효하다.
// 모델을 바꾸면: rag:sync 재실행 + 마이그레이션의 vector(차원)도 함께 변경할 것.
export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIM = 1536;

/** 검색 결과 한 건 (match_rag_documents 반환 행과 일치). */
export interface RetrievedChunk {
  topic: string;
  content: string;
  score: number; // 코사인 유사도 (1에 가까울수록 관련)
}