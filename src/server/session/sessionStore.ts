// 세션 저장소 — 인메모리 (초기 구현).
// 서버리스 환경 배포 시 Redis·Supabase 등으로 교체 예정.
import "server-only";

import type { PendingRagQuestion, StoredRagFact } from "@/core/rag/types";
import type { CollectedItem, ConversationMessage } from "@/core/schemas/turn";

export interface Session {
  sessionId: string;
  history: ConversationMessage[];
  /** 지금까지 누적된 체크리스트 수집 결과. */
  collected: CollectedItem[];
  /** 질문하고 답변까지 확인된 특이 사실. */
  ragFacts: StoredRagFact[];
  /** 물었지만 사용자가 답하지 않은 특이 질문의 targetFact. 같은 질문 반복을 막는다. */
  unansweredRagFacts: string[];
  pendingRagQuestion: PendingRagQuestion | null;
}

class SessionStore {
  private sessions = new Map<string, Session>();

  getOrCreate(sessionId: string): Session {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        history: [],
        collected: [],
        ragFacts: [],
        unansweredRagFacts: [],
        pendingRagQuestion: null,
      };
      this.sessions.set(sessionId, session);
    }
    return session;
  }
}

/** 모듈 수준 단일 인스턴스. 서버리스 배포 시 외부 저장소로 교체 필요. */
export const store = new SessionStore();
