"use client";

import { useEffect } from "react";
import type { InitialView, PostType } from "@/src/types/findgoo";

type InitialViewActions = {
  setType: (type: PostType) => void;
  openChat: () => void;
  openProfile: () => void;
};

// [화면 진입 경로]
export function useInitialAppView(view: InitialView, ready: boolean, actions: InitialViewActions) {
  useEffect(() => {
    if (!ready) return;
    if (view === "chat") { actions.openChat(); return; }
    if (view === "profile") { actions.openProfile(); return; }
    if (view === "buy" || view === "urgent") {
      actions.setType(view);
      window.requestAnimationFrame(() => document.getElementById("market")?.scrollIntoView({ behavior: "instant" }));
    }
  }, [ready, view]);
}
