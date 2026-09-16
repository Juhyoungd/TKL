"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/src/components/common/RequireAuth";
import { AccountDangerZone } from "@/src/components/mypage/AccountDangerZone";
import { InterestSection } from "@/src/components/mypage/InterestSection";
import { KeywordAlertsSection } from "@/src/components/mypage/KeywordAlertsSection";
import { MyMenuGrid } from "@/src/components/mypage/MyMenuGrid";
import { MyPrioritySection } from "@/src/components/mypage/MyPrioritySection";
import { NotificationsSection } from "@/src/components/mypage/NotificationsSection";
import { ProfileCard } from "@/src/components/mypage/ProfileCard";
import { RecentActivitySection } from "@/src/components/mypage/RecentActivitySection";
import { RegionSection } from "@/src/components/mypage/RegionSection";
import { SavedListSection } from "@/src/components/mypage/SavedListSection";
import { ThemeSettingsSection } from "@/src/components/mypage/ThemeSettingsSection";
import { useOfferActions } from "@/src/hooks/use-offer-actions";
import { useProfileSettings } from "@/src/hooks/use-profile-settings";
import { useSavedPosts } from "@/src/hooks/use-saved-posts";
import { useThemePicker } from "@/src/hooks/use-theme-picker";
import { useAppData } from "@/src/state/AppDataProvider";
import { useAuth } from "@/src/state/AuthProvider";
import { useLocalPreferences } from "@/src/state/LocalPreferencesProvider";
import { useToast } from "@/src/state/ToastProvider";
import type { AppNotice } from "@/src/types/findgoo";

// [마이페이지]
export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

function ProfileContent() {
  const router = useRouter();
  const appData = useAppData();
  const auth = useAuth();
  const prefs = useLocalPreferences();
  const { flash } = useToast();
  const offerActions = useOfferActions();
  const saved = useSavedPosts({ flash });
  const themePicker = useThemePicker(prefs.theme, prefs.setTheme);

  const profileNickname = auth.profile?.nickname ?? "";
  const [nicknameDraft, setNicknameDraft] = useState(profileNickname);
  const [nicknameSyncedFor, setNicknameSyncedFor] = useState(profileNickname);
  if (profileNickname !== nicknameSyncedFor) {
    setNicknameSyncedFor(profileNickname);
    setNicknameDraft(profileNickname);
  }

  const profileSettings = useProfileSettings({ keywords: prefs.keywords, setKeywords: prefs.setKeywords, nicknameDraft, setNicknameDraft, flash });

  function handleNoticeClick(notice: AppNotice) {
    appData.markNoticeRead(notice.id);
    if (notice.postId) router.push(`/post/${notice.postId}`);
    else if (notice.conversationId) router.push(`/chat/${notice.conversationId}`);
  }

  async function handleRequestPush() {
    await prefs.requestPushNotifications();
    flash("앱 알림을 켰어요.");
  }

  async function handleLogout() {
    await auth.signOut();
    flash("로그아웃했어요.");
    router.push("/");
  }

  async function handleWithdraw() {
    if (!window.confirm("정말 회원 탈퇴를 요청할까요? 되돌릴 수 없어요.")) return;
    const result = await auth.deleteAccount();
    if (result.error) { flash(result.error); return; }
    flash("회원 탈퇴가 완료됐어요.");
    router.push("/");
  }

  const buyPostCount = appData.posts.filter((post) => post.mine && post.type === "buy").length;
  const urgentPostCount = appData.posts.filter((post) => post.mine && post.type === "urgent").length;

  return (
    <div className="page">
      <h1 className="page-title">마이 찾구</h1>
      <ProfileCard profileImage={auth.profile?.avatarUrl ?? ""} nickname={nicknameDraft} setNickname={setNicknameDraft} onChangeProfileImage={profileSettings.changeProfileImage} onSave={profileSettings.saveSettings} />
      <MyPrioritySection chatCount={appData.conversations.length} pendingIncomingCount={offerActions.pendingIncomingCount} savedCount={saved.savedPosts.length} onOpenChatList={() => router.push("/chat")} onOpenTrade={() => router.push("/offers")} />
      <MyMenuGrid buyPostCount={buyPostCount} urgentPostCount={urgentPostCount} onOpenPanel={(panel) => router.push(`/features?panel=${panel}`)} />
      <RecentActivitySection conversations={appData.conversations} pendingIncomingCount={offerActions.pendingIncomingCount} onOpenChat={(conversation) => router.push(`/chat/${conversation.id}`)} onOpenTrade={() => router.push("/offers")} />
      <NotificationsSection notices={appData.notices} unreadCount={appData.unreadNoticeCount} pushEnabled={prefs.pushEnabled} onMarkAllRead={appData.markAllNoticesRead} onNoticeClick={handleNoticeClick} onTestPush={prefs.deliverTestNotice} onRequestPush={handleRequestPush} />
      <SavedListSection savedPosts={saved.savedPosts} onOpenPost={(postId) => router.push(`/post/${postId}`)} />
      <RegionSection region={auth.profile?.region ?? "지역 미설정"} setRegion={(region) => auth.updateProfile({ region })} activityRegions={prefs.activityRegions} onToggleRegion={(region) => profileSettings.toggleChoice(region, prefs.activityRegions, prefs.setActivityRegions, 3)} />
      <InterestSection interestCategories={prefs.interestCategories} onToggleInterest={(category) => profileSettings.toggleChoice(category, prefs.interestCategories, prefs.setInterestCategories)} />
      <KeywordAlertsSection keywords={prefs.keywords} onAddKeyword={profileSettings.addKeyword} onRemoveKeyword={(keyword) => prefs.setKeywords((items) => items.filter((item) => item !== keyword))} />
      <ThemeSettingsSection theme={prefs.theme} activeThemeLabel={themePicker.activeTheme.label} setTheme={prefs.setTheme} />
      <AccountDangerZone onOpenAdmin={() => router.push("/features?panel=admin")} onLogout={handleLogout} onWithdraw={handleWithdraw} />
    </div>
  );
}
