"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/src/components/layout/SiteHeader";
import { MobileNav } from "@/src/components/layout/MobileNav";
import { Toast } from "@/src/components/common/Toast";
import { useInstallPrompt } from "@/src/hooks/use-install-prompt";
import { useAppData } from "@/src/state/AppDataProvider";
import { useAuth } from "@/src/state/AuthProvider";
import { useLocalPreferences } from "@/src/state/LocalPreferencesProvider";
import { useToast } from "@/src/state/ToastProvider";

// [사이트 전체 레이아웃] 모든 라우트가 공유하는 상단 네비게이션/하단 탭바/토스트.
// 글 상세·채팅·마이페이지 같은 화면은 더 이상 모달이 아니라 각자 자기 경로(/post/[id] 등)를 갖습니다.
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { session, profile, initializing } = useAuth();
  const appData = useAppData();
  const { installPrompt, installApp } = useInstallPrompt();
  const { toast } = useToast();
  const { theme } = useLocalPreferences();
  const isLoggedIn = !initializing && !!session;

  // 로그인/회원가입 화면은 자체 전체화면 레이아웃(.auth-route)을 쓰므로 공통 헤더·탭바를 붙이지 않습니다.
  const isAuthRoute = pathname === "/signin" || pathname === "/signup";
  if (isAuthRoute) {
    return (
      <>
        {children}
        <Toast message={toast} />
      </>
    );
  }

  const pendingIncomingCount = appData.offers.filter((offer) => offer.direction === "incoming" && offer.status === "pending").length;
  const chatBadge = appData.notices.filter((notice) => notice.kind === "chat" && !notice.read).length;
  const myBadge = pendingIncomingCount + appData.unreadNoticeCount;

  return (
    <div className={`findgoo theme-${theme}`}>
      <SiteHeader
        isLoggedIn={isLoggedIn}
        profileImage={profile?.avatarUrl ?? ""}
        nickname={profile?.nickname || profile?.name || "회원"}
        installPrompt={installPrompt}
        installApp={installApp}
        badgeCount={isLoggedIn ? myBadge : 0}
      />
      {children}
      <MobileNav chatBadge={isLoggedIn ? chatBadge : 0} myBadge={isLoggedIn ? myBadge : 0} />
      <Toast message={toast} />
    </div>
  );
}
