"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/src/hooks/use-chat";
import { useDealActions } from "@/src/hooks/use-deal-actions";
import { useFindgooDeviceState } from "@/src/hooks/use-findgoo-device-state";
import { useInitialAppView } from "@/src/hooks/use-initial-app-view";
import { useInstallPrompt } from "@/src/hooks/use-install-prompt";
import { useModalState } from "@/src/hooks/use-modal-state";
import { useNotices } from "@/src/hooks/use-notices";
import { useOfferActions } from "@/src/hooks/use-offer-actions";
import { usePostMarket } from "@/src/hooks/use-post-market";
import { useProfileSettings } from "@/src/hooks/use-profile-settings";
import { useSavedPosts } from "@/src/hooks/use-saved-posts";
import { useSupportForm } from "@/src/hooks/use-support-form";
import { useThemePicker } from "@/src/hooks/use-theme-picker";
import { useToast } from "@/src/hooks/use-toast";
import type { InitialView, Viewer } from "@/src/types/findgoo";

// [찾구 앱 컨트롤러] FindgooApp.tsx가 화면을 그리는 데에만 집중할 수 있도록,
// 상태·저장·도메인별 로직을 각 훅으로 나누고 이 훅에서 하나로 엮어 내려줍니다.
// 각 화면 조각(components/*)은 여기서 반환하는 값 중 필요한 부분만 props로 받습니다.
export function useFindgooApp({ initialUser, initialView }: { initialUser: Viewer; initialView: InitialView }) {
  const router = useRouter();
  const { toast, flash } = useToast();
  const { installPrompt, installApp } = useInstallPrompt();
  const [viewer, setViewer] = useState<Viewer>(initialUser);

  const device = useFindgooDeviceState(initialUser);
  const modal = useModalState(initialView);
  const themePicker = useThemePicker(device.theme, device.setTheme);

  const notices = useNotices({
    notices: device.notices,
    setNotices: device.setNotices,
    pushEnabled: device.pushEnabled,
    setPushEnabled: device.setPushEnabled,
    flash,
  });

  const saved = useSavedPosts({
    posts: device.posts,
    savedPostIds: device.savedPostIds,
    setSavedPostIds: device.setSavedPostIds,
    flash,
  });

  const market = usePostMarket({
    posts: device.posts,
    setPosts: device.setPosts,
    setOffers: device.setOffers,
    setMessages: device.setMessages,
    keywords: device.keywords,
    nickname: device.nickname,
    region: device.region,
    initialType: initialView === "urgent" ? "urgent" : "buy",
    setSettingsOpen: modal.setSettingsOpen,
    deliverNotice: notices.deliverNotice,
    flash,
  });

  const chat = useChat({
    posts: device.posts,
    offers: device.offers,
    messages: device.messages,
    setMessages: device.setMessages,
    viewer,
    setSelected: market.setSelected,
    setTradeOpen: modal.setTradeOpen,
    setChatListOpen: modal.setChatListOpen,
    deliverNotice: notices.deliverNotice,
    flash,
  });

  const offerActions = useOfferActions({
    posts: device.posts,
    offers: device.offers,
    setOffers: device.setOffers,
    setMessages: device.setMessages,
    selected: market.selected,
    setSelected: market.setSelected,
    setTradeOpen: modal.setTradeOpen,
    setChatPost: chat.setChatPost,
    setNickname: device.setNickname,
    deliverNotice: notices.deliverNotice,
    flash,
  });

  const profileSettings = useProfileSettings({
    keywords: device.keywords,
    setKeywords: device.setKeywords,
    setProfileImage: device.setProfileImage,
    setSettingsOpen: modal.setSettingsOpen,
    viewer,
    flash,
  });

  const support = useSupportForm({ viewer, setSupportOpen: modal.setSupportOpen, flash });

  const dealActions = useDealActions({
    chatPost: chat.chatPost,
    selected: market.selected,
    changePostStatus: market.changePostStatus,
    deliverNotice: notices.deliverNotice,
    flash,
  });

  // [전체 기능 관리] 기능명세 패널의 각 버튼을 실제 화면 동작으로 연결하는 지점
  function handleFeatureAction(actionId: string, actionLabel: string) {
    modal.setFeaturePanel(null);
    if (actionId === "guest-login") { const guest = { userId: "guest-device", displayName: device.nickname, email: "비회원 체험" }; setViewer(guest); flash("비회원으로 시작했어요."); return; }
    if (actionId === "naver-login" || actionId === "google-login") { flash(`${actionLabel}은 OAuth 키 연결 후 활성화됩니다.`); return; }
    if (["purchase-create", "urgent-create"].includes(actionId)) { market.setEditor({ open: true, post: null, type: actionId.startsWith("urgent") ? "urgent" : "buy" }); return; }
    if (["purchase-view", "purchase-search", "search-keyword", "search-category", "search-region", "search-price", "sort-latest", "sort-popular"].includes(actionId)) { router.push("/buy"); return; }
    if (["urgent-view", "urgent-apply"].includes(actionId)) { router.push("/urgent"); return; }
    if (["offer-receive", "offer-create", "offer-edit", "offer-cancel", "offer-accept", "offer-reject", "my-offers"].includes(actionId)) { modal.setTradeOpen(true); return; }
    if (["chat-create", "chat-send", "chat-image", "my-chats"].includes(actionId)) { modal.setChatListOpen(true); return; }
    if (["deal-complete", "deal-cancel", "review-create", "report", "block"].includes(actionId)) { dealActions.runDealAction(actionId); return; }
    if (actionId === "trust-view" || actionId === "my-trust") { modal.setFeaturePanel("trust"); return; }
    if (["favorite-list", "favorite-purchase", "favorite-urgent", "my-favorites"].includes(actionId)) { modal.setSettingsOpen(true); window.setTimeout(() => document.getElementById("saved-all")?.scrollIntoView({ behavior: "smooth" }), 120); return; }
    if (["region-setting", "category-setting", "account-edit", "my-profile", "my-notices"].includes(actionId)) { modal.setSettingsOpen(true); return; }
    if (actionId === "terms") { modal.setTermsOpen(true); return; }
    if (["faq", "inquiry-list", "my-support"].includes(actionId)) { modal.setFeaturePanel("support"); return; }
    if (actionId === "inquiry-create") { modal.setSupportOpen(true); return; }
    if (actionId === "logout" || actionId === "my-logout") { setViewer(null); flash("비회원 체험 프로필에서 로그아웃했어요."); return; }
    if (actionId === "withdraw" || actionId === "my-withdraw") { if (window.confirm("정말 회원 탈퇴를 요청할까요?")) flash("탈퇴 요청 화면을 확인했어요. 정식 계정에서는 본인인증 후 처리됩니다."); return; }
    if (actionId.startsWith("admin-")) { flash(`${actionLabel} 운영 화면을 열었어요.`); modal.setFeaturePanel("admin"); return; }
    flash(`${actionLabel} 기능 흐름을 확인했어요.`);
  }

  useInitialAppView(initialView, device.ready, {
    openChat: () => modal.setChatListOpen(true),
    openProfile: () => modal.setSettingsOpen(true),
  });

  return {
    toast,
    flash,
    installPrompt,
    installApp,
    viewer,
    setViewer,
    device,
    modal,
    theme: themePicker,
    notices,
    saved,
    market,
    chat,
    offerActions,
    profileSettings,
    support,
    dealActions,
    handleFeatureAction,
  };
}

export type FindgooAppController = ReturnType<typeof useFindgooApp>;
