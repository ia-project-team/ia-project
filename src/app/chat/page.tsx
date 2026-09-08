import { cookies } from "next/headers";

import { GUEST_CHAT_LIMIT, type ChatUsage } from "@/core/chat/limits";
import {
  getGuestUsageSecret,
  GUEST_USAGE_COOKIE,
  readGuestUsageToken,
} from "@/server/session/guestUsage";
import { getOptionalAuthUser } from "@/server/supabase/authClient";

import { Chat } from "./_components/Chat";

export default async function ChatPage() {
  const [cookieStore, user] = await Promise.all([
    cookies(),
    getOptionalAuthUser(),
  ]);

  const used = user
    ? 0
    : readGuestUsageToken(
        cookieStore.get(GUEST_USAGE_COOKIE)?.value,
        getGuestUsageSecret(),
      );
  const usage: ChatUsage = user
    ? { authenticated: true, used: 0, limit: null, remaining: null }
    : {
        authenticated: false,
        used,
        limit: GUEST_CHAT_LIMIT,
        remaining: Math.max(0, GUEST_CHAT_LIMIT - used),
      };

  return <Chat initialUsage={usage} userEmail={user?.email ?? null} />;
}
