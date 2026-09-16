// [오류 메시지 한글화] Supabase(Auth/DB)가 영어로 내려주는 오류를 화면에 보여줄 한국어 문구로 바꿉니다.
const knownMessages: [RegExp, string][] = [
  [/invalid login credentials/i, "이메일 또는 비밀번호가 올바르지 않아요."],
  [/user already registered|already been registered/i, "이미 가입된 이메일이에요. 로그인해 주세요."],
  [/email not confirmed/i, "이메일 인증이 필요해요. 받은 메일함을 확인해 주세요."],
  [/password should be at least/i, "비밀번호는 6자 이상이어야 해요."],
  [/new password should be different/i, "이전과 다른 비밀번호를 입력해 주세요."],
  [/unable to validate email address|invalid.*email/i, "이메일 형식이 올바르지 않아요."],
  [/email rate limit exceeded|for security purposes|rate limit/i, "요청이 너무 많아요. 잠시 후 다시 시도해 주세요."],
  [/signups? (is|are) disabled/i, "지금은 회원가입을 받지 않고 있어요."],
  [/token has expired or is invalid/i, "인증 링크가 만료됐어요. 다시 시도해 주세요."],
  [/user not found/i, "가입되지 않은 계정이에요."],
  [/failed to fetch|network|fetch failed/i, "네트워크 연결을 확인해 주세요."],
  [/row-level security|permission denied|not authorized/i, "이 작업을 할 권한이 없어요."],
  [/duplicate key|already exists|unique constraint/i, "이미 등록되어 있어요."],
  [/violates.*not-null|null value in column/i, "필수 항목을 입력해 주세요."],
  [/violates.*check constraint/i, "입력한 값을 확인해 주세요."],
  [/jwt|not authenticated|auth session missing/i, "로그인이 필요해요."],
];

// 위 패턴에 없는 오류는 원문을 콘솔에만 남기고, 화면에는 안전한 한국어 문구만 보여줍니다.
export function translateSupabaseError(error: { message?: string } | string | null | undefined): string | null {
  if (!error) return null;
  const message = typeof error === "string" ? error : error.message ?? "";
  if (!message) return "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";

  for (const [pattern, translated] of knownMessages) {
    if (pattern.test(message)) return translated;
  }
  console.warn("[supabase] 번역되지 않은 오류:", message);
  return "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";
}
