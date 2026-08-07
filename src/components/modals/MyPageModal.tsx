"use client";

import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
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
import type { AppNotice, ChatMessage, FeaturePanelKey, Post, ThemeId } from "@/src/types/findgoo";

type MyPageModalProps = {
  onClose: () => void;
  unreadCount: number;
  onMarkAllRead: () => void;
  profileImage: string;
  nickname: string;
  setNickname: Dispatch<SetStateAction<string>>;
  onChangeProfileImage: (event: ChangeEvent<HTMLInputElement>) => void;
  onSaveSettings: () => void;
  chatPosts: Post[];
  pendingIncomingCount: number;
  savedPosts: Post[];
  messages: ChatMessage[];
  notices: AppNotice[];
  pushEnabled: boolean;
  onNoticeClick: (notice: AppNotice) => void;
  onTestPush: () => void;
  onRequestPush: () => void;
  onOpenChat: (post: Post) => void;
  onOpenPost: (postId: string) => void;
  buyPostCount: number;
  urgentPostCount: number;
  region: string;
  setRegion: Dispatch<SetStateAction<string>>;
  activityRegions: string[];
  onToggleRegion: (region: string) => void;
  interestCategories: string[];
  onToggleInterest: (category: string) => void;
  keywords: string[];
  onAddKeyword: (event: FormEvent<HTMLFormElement>) => void;
  onRemoveKeyword: (keyword: string) => void;
  theme: ThemeId;
  activeThemeLabel: string;
  setTheme: (theme: ThemeId) => void;
  onOpenTrade: () => void;
  onOpenChatList: () => void;
  onOpenPanel: (panel: FeaturePanelKey) => void;
  onLogout: () => void;
  onWithdraw: () => void;
};

// [마이페이지] 각 영역을 components/mypage/* 하위 컴포넌트로 나누고 이 화면은 조립만 담당합니다.
export function MyPageModal(props: MyPageModalProps) {
  const {
    onClose, unreadCount, onMarkAllRead, profileImage, nickname, setNickname, onChangeProfileImage, onSaveSettings,
    chatPosts, pendingIncomingCount, savedPosts, messages, notices, pushEnabled, onNoticeClick, onTestPush, onRequestPush,
    onOpenChat, onOpenPost, buyPostCount, urgentPostCount, region, setRegion, activityRegions, onToggleRegion,
    interestCategories, onToggleInterest, keywords, onAddKeyword, onRemoveKeyword, theme, activeThemeLabel, setTheme,
    onOpenTrade, onOpenChatList, onOpenPanel, onLogout, onWithdraw,
  } = props;

  return (
    <div className="modal-layer my-layer" onMouseDown={onClose}>
      <section className="my-page" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <button onClick={onClose}>←</button>
          <strong>마이 찾구</strong>
          <button className="notice-head" onClick={onMarkAllRead}>알림 {unreadCount > 0 && <b>{unreadCount}</b>}</button>
        </header>
        <div className="my-scroll">
          <ProfileCard profileImage={profileImage} nickname={nickname} setNickname={setNickname} onChangeProfileImage={onChangeProfileImage} onSave={onSaveSettings} />

          <MyPrioritySection chatCount={chatPosts.length} pendingIncomingCount={pendingIncomingCount} savedCount={savedPosts.length} onOpenChatList={onOpenChatList} onOpenTrade={onOpenTrade} />

          {/* [마이페이지] */}
          <MyMenuGrid buyPostCount={buyPostCount} urgentPostCount={urgentPostCount} onOpenPanel={onOpenPanel} />

          <RecentActivitySection chatPosts={chatPosts} messages={messages} pendingIncomingCount={pendingIncomingCount} onOpenChat={onOpenChat} onOpenTrade={onOpenTrade} />

          <NotificationsSection notices={notices} unreadCount={unreadCount} pushEnabled={pushEnabled} onMarkAllRead={onMarkAllRead} onNoticeClick={onNoticeClick} onTestPush={onTestPush} onRequestPush={onRequestPush} />

          {/* [찜 목록] */}
          <SavedListSection savedPosts={savedPosts} onOpenPost={onOpenPost} />

          <RegionSection region={region} setRegion={setRegion} activityRegions={activityRegions} onToggleRegion={onToggleRegion} />

          <InterestSection interestCategories={interestCategories} onToggleInterest={onToggleInterest} />

          <KeywordAlertsSection keywords={keywords} onAddKeyword={onAddKeyword} onRemoveKeyword={onRemoveKeyword} />

          {/* [앱 색상] */}
          <ThemeSettingsSection theme={theme} activeThemeLabel={activeThemeLabel} setTheme={setTheme} />

          {/* [로그아웃] + [회원 탈퇴] + [관리자] */}
          <AccountDangerZone onOpenAdmin={() => onOpenPanel("admin")} onLogout={onLogout} onWithdraw={onWithdraw} />

          <p className="beta-storage-note">현재 공개 베타에서는 프로필·찜·키워드가 이 기기에 저장됩니다. 정식 회원 서버 연결 후 계정별로 동기화됩니다.</p>
          <button className="my-save" onClick={onSaveSettings}>설정 저장하고 닫기</button>
        </div>
      </section>
    </div>
  );
}
