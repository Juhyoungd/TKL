"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { InstallPromptEvent } from "@/src/types/findgoo";

type SiteHeaderProps = {
  isLoggedIn: boolean;
  profileImage: string;
  nickname: string;
  installPrompt: InstallPromptEvent | null;
  installApp: () => void;
  badgeCount: number;
};

// [상단 네비게이션] 로그인 전에는 로그인/회원가입 링크를, 로그인 후에는 마이페이지 진입 버튼을 보여줍니다.
export function SiteHeader({ isLoggedIn, profileImage, nickname, installPrompt, installApp, badgeCount }: SiteHeaderProps) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="site-header clean-header">
      <Link className="findgoo-brand" href="/"><span className="logo-stamp">찾</span><strong>찾구</strong><small className="beta-pill">BETA</small></Link>
      <nav className="desktop-nav">
        <Link href="/" className={isActive("/") && pathname === "/" ? "active" : ""}>홈</Link>
        <Link href="/buy" className={isActive("/buy") ? "active" : ""}>구매</Link>
        <Link href="/urgent" className={isActive("/urgent") ? "active" : ""}>급구</Link>
        {isLoggedIn && <Link href="/chat" className={isActive("/chat") ? "active" : ""}>채팅</Link>}
        {isLoggedIn && <Link href="/profile" className={isActive("/profile") ? "active" : ""}>마이</Link>}
      </nav>
      <div className="account-actions">
        {installPrompt && <button className="install-button" onClick={installApp}>앱 설치</button>}
        {isLoggedIn ? (
          <Link className="profile-button" href="/profile" aria-label="마이페이지 열기">
            {profileImage ? <img src={profileImage} alt="내 프로필" /> : <span>{nickname[0]}</span>}
            <em>마이</em>
            {badgeCount > 0 && <b>{badgeCount}</b>}
          </Link>
        ) : (
          <>
            <Link className="login-button" href="/signin">로그인</Link>
            <Link className="signup-link" href="/signup">회원가입</Link>
          </>
        )}
      </div>
    </header>
  );
}
