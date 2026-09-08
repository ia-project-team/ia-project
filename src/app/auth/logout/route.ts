import { NextResponse, type NextRequest } from "next/server";

import {
  getSupabaseAuth,
  hasSupabaseAuthConfig,
} from "@/server/supabase/authClient";

export async function POST(request: NextRequest) {
  if (hasSupabaseAuthConfig()) {
    const supabase = await getSupabaseAuth();
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
