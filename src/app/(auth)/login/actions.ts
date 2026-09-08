"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { LoginFormSchema, type LoginFormState } from "@/core/schemas/auth";
import {
  getSupabaseAuth,
  hasSupabaseAuthConfig,
} from "@/server/supabase/authClient";

export async function login(
  _state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const validated = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors };
  }

  if (!hasSupabaseAuthConfig()) {
    return { message: "로그인 설정을 확인 중입니다. 잠시 후 다시 시도해주세요." };
  }

  const supabase = await getSupabaseAuth();
  const { error } = await supabase.auth.signInWithPassword(validated.data);

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { message: "이메일 확인을 먼저 완료해주세요." };
    }
    if (error.code === "invalid_credentials") {
      return { message: "이메일 또는 비밀번호가 올바르지 않습니다." };
    }
    return { message: "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }

  redirect("/chat?welcome=1");
}
