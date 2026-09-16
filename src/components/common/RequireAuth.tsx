"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/src/state/AuthProvider";

// [로그인 필요] 로그인해야만 쓸 수 있는 화면을 감쌉니다. 비로그인 방문자에게는
// 안내 카드와 함께 로그인/회원가입 링크를 보여줍니다(돌아올 경로를 붙여서).
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, initializing } = useAuth();
  const pathname = usePathname();

  if (initializing) return <div className="page"><p>불러오는 중…</p></div>;

  if (!session) {
    const returnTo = encodeURIComponent(pathname);
    return (
      <div className="auth-required">
        <span className="logo-stamp large">찾</span>
        <h2>로그인이 필요해요</h2>
        <p>이 화면은 로그인한 회원만 볼 수 있어요.</p>
        <div className="auth-required-actions">
          <Link href={`/signin?returnTo=${returnTo}`}>로그인</Link>
          <Link href="/signup">회원가입</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
