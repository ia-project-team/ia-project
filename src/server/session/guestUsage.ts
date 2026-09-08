import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { GUEST_CHAT_LIMIT } from "@/core/chat/limits";

export const GUEST_USAGE_COOKIE = "lawpre_guest_usage";
export const GUEST_USAGE_MAX_AGE = 60 * 60 * 24 * 90;

function signatureFor(count: number, secret: string): string {
  return createHmac("sha256", secret)
    .update(`lawpre-guest-turns:${count}`)
    .digest("base64url");
}

export function createGuestUsageToken(count: number, secret: string): string {
  const safeCount = Math.max(0, Math.min(GUEST_CHAT_LIMIT, Math.trunc(count)));
  return `${safeCount}.${signatureFor(safeCount, secret)}`;
}

export function readGuestUsageToken(
  token: string | undefined,
  secret: string,
): number {
  if (!token) return 0;

  const separator = token.indexOf(".");
  if (separator < 1) return 0;

  const rawCount = token.slice(0, separator);
  const suppliedSignature = token.slice(separator + 1);
  const count = Number(rawCount);

  if (!Number.isInteger(count) || count < 0 || count > GUEST_CHAT_LIMIT) {
    return 0;
  }

  const expected = Buffer.from(signatureFor(count, secret));
  const supplied = Buffer.from(suppliedSignature);
  if (expected.length !== supplied.length) return 0;

  return timingSafeEqual(expected, supplied) ? count : 0;
}

export function getGuestUsageSecret(): string {
  const configured = process.env.GUEST_USAGE_SECRET;
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error("GUEST_USAGE_SECRET 환경변수가 필요합니다.");
  }

  return "lawpre-local-development-only-change-me";
}
