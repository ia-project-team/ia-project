// 세션 저장소 (c안).
//
// (c)안에서 서버의 핵심 역할이 바로 여기다. AI가 대화 맥락 전체를 보고
// 판단·진행하므로, "대화 기록을 빠짐없이 보관하고 다음 턴에 그대로
// 넘기는 것"이 서버가 책임지는 거의 유일한 일이 된다.
//
// 5/31 합의(Conversations API·previous_response_id 미사용)에 따라, OpenAI에
// 상태를 맡기지 않고 우리가 history 배열을 직접 들고 매 턴 통째로 넘긴다.

import type { Message } from "../types";

export interface Session {
  sessionId: string;
  history: Message[];
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

// 모듈 수준 단일 인스턴스 (간단한 사이드 프로젝트 기준).
// 배포(서버리스) 시에는 Redis 등으로 교체 필요.
export const store = new SessionStore();
