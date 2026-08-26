// RAG 타입·상수 정의 — 순수 모듈, 외부 의존 없음 (Next.js 밖 스크립트에서도 사용).

// 문서·쿼리 임베딩에 반드시 같은 모델을 써야 검색이 유효하다.
// 모델을 바꾸면: rag:sync 재실행 + 마이그레이션의 vector(차원)도 함께 변경할 것.
export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIM = 1536;

export type RagServiceFit = "direct" | "conditional";
export type RagAnswerStatus = "complete" | "missing";

/** 검색 결과 한 건 (match_rag_cases 반환 행과 일치). */
export interface RetrievedCase {
  id: string;
  dataset: string;
  sourceRow: number;
  legalCategory: string;
  issue: string | null;
  serviceFit: RagServiceFit;
  question: string;
  answer: string | null;
  answerStatus: RagAnswerStatus;
  decisionReason: string | null;
  score: number; // 최종 검색 관련도 (검색 백엔드에 따라 코사인 또는 하이브리드 상대 점수)
  recordType?: string;
  applicabilityGate?: string[];
  userSignals?: string[];
  targetFact?: string;
  whyMaterial?: string;
  statutes?: string[];
  sourceTitle?: string;
  sourceUrl?: string;
  vectorScore?: number;
  lexicalScore?: number;
  vectorRank?: number;
  lexicalRank?: number;
  matchedGates?: string[];
}

/** 실제로 사용자에게 물어본 RAG 특이 질문에 대한 확인 완료 사실. */
export interface StoredRagFact {
  targetFact: string;
  question: string;
  answer: string;
  sourceCaseIds: string[];
  askedAtTurn: number;
  answeredAtTurn: number;
}

/** 사용자 답변을 기다리는 현재 RAG 특이 질문. */
export interface PendingRagQuestion {
  targetFact: string;
  question: string;
  sourceCaseIds: string[];
  askedAtTurn: number;
}
