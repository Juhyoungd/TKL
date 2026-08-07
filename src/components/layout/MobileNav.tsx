"use client";

import { appIcons } from "@/src/assets/app-icons";
import type { BottomNavKey } from "@/src/types/findgoo";

type MobileNavProps = {
  activeNav: BottomNavKey;
  onHome: () => void;
  onUrgent: () => void;
  onCreate: () => void;
  onChat: () => void;
  onMy: () => void;
  chatBadge: number;
  myBadge: number;
};

// [하단 메뉴]
export function MobileNav({ activeNav, onHome, onUrgent, onCreate, onChat, onMy, chatBadge, myBadge }: MobileNavProps) {
  return (
    <nav className="mobile-nav" aria-label="주요 메뉴">
      <button className={activeNav === "home" ? "active" : ""} aria-current={activeNav === "home" ? "page" : undefined} onClick={onHome}><span>{appIcons.home}</span>홈</button>
      <button className={activeNav === "urgent" ? "active" : ""} aria-current={activeNav === "urgent" ? "page" : undefined} onClick={onUrgent}><span>{appIcons.urgent}</span>급구</button>
      <button className={`write ${activeNav === "create" ? "active" : ""}`} aria-current={activeNav === "create" ? "page" : undefined} onClick={onCreate}><span>{appIcons.create}</span>등록</button>
      <button className={activeNav === "chat" ? "active" : ""} aria-current={activeNav === "chat" ? "page" : undefined} onClick={onChat}><span>{appIcons.chat}</span>채팅{chatBadge > 0 && <b className="nav-badge">{chatBadge}</b>}</button>
      <button className={activeNav === "my" ? "active" : ""} aria-current={activeNav === "my" ? "page" : undefined} onClick={onMy}><span>{appIcons.profile}</span>마이{myBadge > 0 && <b className="nav-badge">{myBadge}</b>}</button>
    </nav>
  );
}
