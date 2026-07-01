// 세션 저장소 — 인메모리 (초기 구현).
// 서버리스 환경 배포 시 Redis·Supabase 등으로 교체 예정.
import "server-only";

import type { ConversationMessage } from "@/core/schemas/turn";

export interface Session {
  sessionId: string;
  history: ConversationMessage[];
}

class SessionStore {
  private sessions = new Map<string, Session>();

  getOrCreate(sessionId: string): Session {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = { sessionId, history: [] };
      this.sessions.set(sessionId, session);
    }
    return session;
  }
}

/** 모듈 수준 단일 인스턴스. 서버리스 배포 시 외부 저장소로 교체 필요. */
export const store = new SessionStore();
