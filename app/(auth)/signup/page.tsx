"use client";

import { Suspense, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/state/AuthProvider";

// [회원가입]
export default function SignUpPage() {
  return (
    <Suspense fallback={<main className="auth-route"><section><p>불러오는 중…</p></section></main>}>
      <SignUpForm />
    </Suspense>
  );
}

function SignUpForm() {
  const { signUp, session } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const returnTo = searchParams.get("returnTo");
  const signinHref = returnTo ? `/signin?returnTo=${encodeURIComponent(returnTo)}` : "/signin";

  // 이메일 인증 없이 바로 가입이 완료되는 프로젝트 설정이면, 가입 직후 세션이 생기는 즉시 이동합니다.
  useEffect(() => {
    if (done && session) router.push(returnTo && returnTo.startsWith("/") ? returnTo : "/");
  }, [done, session, returnTo, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 해요."); return; }

    setSubmitting(true);
    const result = await signUp({
      email: String(form.get("email")),
      password,
      name: String(form.get("name")),
      nickname: String(form.get("nickname")),
      phone: String(form.get("phone")),
    });
    setSubmitting(false);
    if (result.error) { setError(result.error); return; }
    setDone(true);
  }

  if (done) {
    return (
      <main className="auth-route">
        <section>
          <span className="logo-stamp large">찾</span>
          <small>FINDGOO ACCOUNT</small>
          <h1>가입 완료</h1>
          <p>이메일 인증이 필요하다면 받은 메일함을 확인해 주세요. 인증이 끝나면 로그인할 수 있어요.</p>
          <Link href={signinHref}>로그인하러 가기</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-route">
      <section>
        <span className="logo-stamp large">찾</span>
        <small>FINDGOO ACCOUNT</small>
        <h1>회원가입</h1>
        <p>findgoo-app(모바일)과 같은 계정으로 이용할 수 있어요.</p>
        <form onSubmit={handleSubmit}>
          <label><span>이름</span><input name="name" required minLength={2} maxLength={30} autoComplete="name" /></label>
          <label><span>닉네임</span><input name="nickname" required minLength={2} maxLength={20} /></label>
          <label><span>휴대폰 번호</span><input name="phone" type="tel" required placeholder="010-0000-0000" /></label>
          <label><span>이메일</span><input name="email" type="email" required autoComplete="email" /></label>
          <label><span>비밀번호</span><input name="password" type="password" required minLength={6} autoComplete="new-password" /></label>
          {error && <p className="auth-error">{error}</p>}
          <button className="form-submit" type="submit" disabled={submitting}>{submitting ? "가입 중…" : "회원가입"}</button>
        </form>
        <p className="auth-switch">이미 계정이 있으신가요? <Link href={signinHref}>로그인</Link></p>
      </section>
    </main>
  );
}
