// Supabase 클라이언트 팩토리 — server-only.
// secret 키를 사용하므로 절대 클라이언트 번들에 포함되면 안 된다.
import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 .env.local에 필요합니다.");
  }

  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}