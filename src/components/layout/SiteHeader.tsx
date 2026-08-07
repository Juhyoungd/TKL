"use client";

import type { InstallPromptEvent } from "@/src/types/findgoo";

type SiteHeaderProps = {
  profileImage: string;
  nickname: string;
  installPrompt: InstallPromptEvent | null;
  installApp: () => void;
  badgeCount: number;
  onScrollTop: () => void;
  onShowBuy: () => void;
  onShowUrgent: () => void;
  onOpenChatList: () => void;
  onOpenSettings: () => void;
};

// [홈] 상단 브랜드/데스크톱 메뉴/마이페이지 진입 버튼
export function SiteHeader({ profileImage, nickname, installPrompt, installApp, badgeCount, onScrollTop, onShowBuy, onShowUrgent, onOpenChatList, onOpenSettings }: SiteHeaderProps) {
  return (
    <header className="site-header clean-header">
      <a className="findgoo-brand" href="#top"><span className="logo-stamp">찾</span><strong>찾구</strong><small className="beta-pill">BETA</small></a>
      <nav className="desktop-nav">
        <button onClick={onScrollTop}>홈</button>
        <button onClick={onShowBuy}>구매</button>
        <button onClick={onShowUrgent}>급구</button>
        <button onClick={onOpenChatList}>채팅</button>
        <button onClick={onOpenSettings}>마이</button>
      </nav>
      <div className="account-actions">
        {installPrompt && <button className="install-button" onClick={installApp}>앱 설치</button>}
        <button className="profile-button" onClick={onOpenSettings} aria-label="마이페이지 열기">
          {profileImage ? <img src={profileImage} alt="내 프로필" /> : <span>{nickname[0]}</span>}
          <em>마이</em>
          {badgeCount > 0 && <b>{badgeCount}</b>}
        </button>
      </div>
    </header>
  );
}
