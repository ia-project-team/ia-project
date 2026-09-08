import { describe, expect, it } from "vitest";

import { GUEST_CHAT_LIMIT } from "@/core/chat/limits";
import {
  createGuestUsageToken,
  readGuestUsageToken,
} from "@/server/session/guestUsage";

const SECRET = "test-secret-long-enough-for-hmac";

describe("비회원 채팅 사용량 토큰", () => {
  it("서명된 사용량을 복원한다", () => {
    const token = createGuestUsageToken(7, SECRET);

    expect(readGuestUsageToken(token, SECRET)).toBe(7);
  });

  it("위변조된 사용량은 인정하지 않는다", () => {
    const token = createGuestUsageToken(7, SECRET);
    const forged = `1.${token.split(".")[1]}`;

    expect(readGuestUsageToken(forged, SECRET)).toBe(0);
  });

  it("한도보다 큰 값을 저장하지 않는다", () => {
    const token = createGuestUsageToken(999, SECRET);

    expect(readGuestUsageToken(token, SECRET)).toBe(GUEST_CHAT_LIMIT);
  });

  it("다른 서버 키로 만든 토큰은 인정하지 않는다", () => {
    const token = createGuestUsageToken(3, SECRET);

    expect(readGuestUsageToken(token, "different-secret")).toBe(0);
  });
});
