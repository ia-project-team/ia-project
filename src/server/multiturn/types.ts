// 멀티턴 엔진 공용 타입 (c안: AI 주도).

/** 대화 한 줄. Responses API의 input 항목으로 그대로 넘긴다. */
export interface Message {
  role: "user" | "assistant";
  content: string;
}

/** 체크리스트 항목 정의. (c안에서는 서버가 "정의"만 갖고, 충족 판단은 AI가 한다.) */
export interface ChecklistItemDef {
  key: string;
  label: string;
  required: boolean;
}

/** 대화 단계. AI가 스스로 판단해 선언한다. */
export type Phase = "collecting" | "ready_to_advise" | "done";
