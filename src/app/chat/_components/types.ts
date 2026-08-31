// 멀티턴 UI에서 쓰는 화면용 메시지 타입.
// 서버(/api/multiturn)는 history를 직접 관리하므로 클라이언트는 표시용으로만 보관한다.
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}
