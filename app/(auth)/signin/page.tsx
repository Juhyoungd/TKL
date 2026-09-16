"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/state/AuthProvider";

// [로그인]
export default function SignInPage() {
  return (
    <Suspense fallback={<main className="auth-route"><section><p>불러오는 중…</p></section></main>}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const result = await signIn(String(form.get("email")), String(form.get("password")));
    setSubmitting(false);
    if (result.error) { setError(result.error); return; }
    const returnTo = searchParams.get("returnTo");
    router.push(returnTo && returnTo.startsWith("/") ? returnTo : "/");
  }

  return (
    <main className="auth-route">
      <section>
        <span className="logo-stamp large">찾</span>
        <small>FINDGOO ACCOUNT</small>
        <h1>로그인</h1>
        <p>이메일과 비밀번호로 로그인하세요.</p>
        <form onSubmit={handleSubmit}>
          <label><span>이메일</span><input name="email" type="email" required autoComplete="email" /></label>
          <label><span>비밀번호</span><input name="password" type="password" required minLength={6} autoComplete="current-password" /></label>
          {error && <p className="auth-error">{error}</p>}
          <button className="form-submit" type="submit" disabled={submitting}>{submitting ? "로그인 중…" : "로그인"}</button>
        </form>
        <p className="auth-switch">아직 계정이 없으신가요? <Link href="/signup">회원가입</Link></p>
      </section>
    </main>
  );
}
