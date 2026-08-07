"use client";

import { useEffect } from "react";
import type { InitialView } from "@/src/types/findgoo";

type InitialViewActions = {
  openChat: () => void;
  openProfile: () => void;
};

// [화면 진입 경로] buy/urgent는 이제 /buy, /urgent 전용 페이지가 담당하므로
// 여기서는 같은 페이지 위에서 열어야 하는 채팅/마이페이지 모달만 다룹니다.
export function useInitialAppView(view: InitialView, ready: boolean, actions: InitialViewActions) {
  useEffect(() => {
    if (!ready) return;
    if (view === "chat") { actions.openChat(); return; }
    if (view === "profile") { actions.openProfile(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, view]);
}
