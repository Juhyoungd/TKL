"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appIcons } from "@/src/assets/app-icons";

type MobileNavProps = {
  chatBadge: number;
  myBadge: number;
};

// [하단 메뉴] 모바일 화면(≤760px)에서만 보이는 보조 내비게이션. 현재 경로로 활성 탭을 표시합니다.
export function MobileNav({ chatBadge, myBadge }: MobileNavProps) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav className="mobile-nav" aria-label="주요 메뉴">
      <Link href="/" className={isActive("/") && pathname === "/" ? "active" : ""} aria-current={pathname === "/" ? "page" : undefined}><span>{appIcons.home}</span>홈</Link>
      <Link href="/urgent" className={isActive("/urgent") ? "active" : ""} aria-current={isActive("/urgent") ? "page" : undefined}><span>{appIcons.urgent}</span>급구</Link>
      <Link href="/post/new" className={`write ${isActive("/post/new") ? "active" : ""}`} aria-current={isActive("/post/new") ? "page" : undefined}><span>{appIcons.create}</span>등록</Link>
      <Link href="/chat" className={isActive("/chat") ? "active" : ""} aria-current={isActive("/chat") ? "page" : undefined}><span>{appIcons.chat}</span>채팅{chatBadge > 0 && <b className="nav-badge">{chatBadge}</b>}</Link>
      <Link href="/profile" className={isActive("/profile") ? "active" : ""} aria-current={isActive("/profile") ? "page" : undefined}><span>{appIcons.profile}</span>마이{myBadge > 0 && <b className="nav-badge">{myBadge}</b>}</Link>
    </nav>
  );
}
