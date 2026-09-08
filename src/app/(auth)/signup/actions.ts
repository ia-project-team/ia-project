"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";

import { SignupFormSchema, type SignupFormState } from "@/core/schemas/auth";
import {
  getSupabaseAuth,
  hasSupabaseAuthConfig,
} from "@/server/supabase/authClient";

export async function signup(
  _state: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const validated = SignupFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors };
  }

  const { email, password } = validated.data;
  if (!hasSupabaseAuthConfig()) {
    return { message: "회원가입 설정을 확인 중입니다. 잠시 후 다시 시도해주세요." };
  }

  const supabase = await getSupabaseAuth();
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  const origin = configuredOrigin ??
    (process.env.NODE_ENV !== "production" && host
      ? `${protocol}://${host}`
      : undefined);

  if (!origin) {
    return { message: "가입 확인 주소가 설정되지 않았습니다. 관리자에게 문의해주세요." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/confirm?next=/chat` },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { message: "이미 가입된 이메일입니다." };
    }
    if (error.code === "email_address_invalid") {
      return { message: "사용할 수 없는 이메일 주소입니다. 실제 사용하는 이메일을 입력해주세요." };
    }
    if (error.code === "over_email_send_rate_limit") {
      return { message: "이메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요." };
    }
    return { message: "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }

  // 이메일 확인(Confirm email)이 켜져 있으면 세션 없이 유저만 생성된다.
  if (!data.session) {
    return {
      success: true,
      message: "확인 이메일을 보냈습니다. 메일함에서 링크를 눌러 가입을 완료해주세요.",
    };
  }

  redirect("/chat?welcome=1");
}
