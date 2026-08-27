// 인증 폼 스키마와 폼 상태 타입.
import { z } from "zod";

export const SignupFormSchema = z
  .object({
    email: z.email({ error: "올바른 이메일 주소를 입력해주세요." }).trim(),
    password: z
      .string()
      .min(8, { error: "비밀번호는 8자 이상이어야 합니다." })
      .regex(/[a-zA-Z]/, { error: "영문자를 1개 이상 포함해야 합니다." })
      .regex(/[0-9]/, { error: "숫자를 1개 이상 포함해야 합니다." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type SignupFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;
