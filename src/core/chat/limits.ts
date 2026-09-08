export const GUEST_CHAT_LIMIT = 10;

export interface ChatUsage {
  authenticated: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
}

export const GUEST_LIMIT_ERROR_CODE = "GUEST_LIMIT_REACHED" as const;
