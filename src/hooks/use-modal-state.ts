"use client";

import { useState } from "react";
import { initialNavForView } from "@/src/store/app-store";
import type { BottomNavKey, FeaturePanelKey, InitialView } from "@/src/types/findgoo";

// [화면 열림 상태] 채팅방/제안함/설정 같은 개별 도메인 상태와 달리, 어떤 모달과
// 하단 탭이 열려 있는지는 여러 화면이 함께 참조하는 "UI 전용" 상태라 한곳에 모읍니다.
export function useModalState(initialView: InitialView) {
  const [featurePanel, setFeaturePanel] = useState<FeaturePanelKey | null>(null);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [chatListOpen, setChatListOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<BottomNavKey>(() => initialNavForView(initialView));

  return {
    featurePanel, setFeaturePanel,
    tradeOpen, setTradeOpen,
    chatListOpen, setChatListOpen,
    supportOpen, setSupportOpen,
    settingsOpen, setSettingsOpen,
    termsOpen, setTermsOpen,
    activeNav, setActiveNav,
  };
}
