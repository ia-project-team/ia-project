// 세션 저장소 — 인메모리 (초기 구현).
// 서버리스 환경 배포 시 Redis·Supabase 등으로 교체 예정.
import "server-only";

import type { PendingRagQuestion, StoredRagFact } from "@/core/rag/types";
import type { CollectedItem, ConversationMessage } from "@/core/schemas/turn";
import { getSupabase } from "@/server/supabase/client";

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

  private create(sessionId: string): Session {
    return {
      sessionId,
      history: [],
      collected: [],
      ragFacts: [],
      unansweredRagFacts: [],
      pendingRagQuestion: null,
    };
  }

  private hasPersistentStore(): boolean {
    return Boolean(
      process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  async getOrCreate(sessionId: string, userId: string | null): Promise<Session> {
    if (this.hasPersistentStore()) {
      const { data, error } = await getSupabase()
        .from("chat_sessions")
        .select("session_id,user_id,state")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        if (data.user_id && data.user_id !== userId) {
          throw new Error("이 대화에 접근할 권한이 없습니다.");
        }

        const saved = data.state as Omit<Session, "sessionId">;
        return { ...saved, sessionId };
      }

      return this.create(sessionId);
    }

    let session = this.sessions.get(sessionId);
    if (!session) {
      session = this.create(sessionId);
      this.sessions.set(sessionId, session);
    }
    return session;
  }

  async save(session: Session, userId: string | null): Promise<void> {
    if (this.hasPersistentStore()) {
      const { sessionId, ...state } = session;
      const { error } = await getSupabase().from("chat_sessions").upsert(
        {
          session_id: sessionId,
          user_id: userId,
          state,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "session_id" },
      );
      if (error) throw error;
      return;
    }

    this.sessions.set(session.sessionId, session);
  }
}

/** Supabase 설정 시 영속 저장하며, 로컬 최소 설정에서는 메모리를 사용한다. */
export const store = new SessionStore();
