"use client";

import { usePathname, useRouter } from "next/navigation";
import { Toast } from "@/src/components/common/Toast";
import { FeaturePanel } from "@/src/components/feature/FeaturePanel";
import { HomeOverview } from "@/src/components/home/HomeOverview";
import { MobileNav } from "@/src/components/layout/MobileNav";
import { SiteHeader } from "@/src/components/layout/SiteHeader";
import { MarketSection } from "@/src/components/market/MarketSection";
import { ChatListModal } from "@/src/components/modals/ChatListModal";
import { ChatModal } from "@/src/components/modals/ChatModal";
import { MyPageModal } from "@/src/components/modals/MyPageModal";
import { PostDetailModal } from "@/src/components/modals/PostDetailModal";
import { PostEditorModal } from "@/src/components/modals/PostEditorModal";
import { SupportModal } from "@/src/components/modals/SupportModal";
import { TermsModal } from "@/src/components/modals/TermsModal";
import { TradeCenterModal } from "@/src/components/modals/TradeCenterModal";
import { useFindgooApp } from "@/src/hooks/use-findgoo-app";
import type { AppNotice, FeaturePanelKey, InitialView, PostType, Viewer } from "@/src/types/findgoo";

// [찾구 앱] 화면 조립만 담당합니다. 상태와 도메인 로직은 useFindgooApp과 그 하위 훅들이,
// 각 화면 조각은 components/* 가 담당합니다.
// 구매글/급구 목록은 홈에 끼워넣지 않고 /buy, /urgent 전용 페이지에서만 보여줍니다.
export function FindgooApp({ initialUser = null, initialView = "home" }: { initialUser?: Viewer; initialView?: InitialView }) {
  const app = useFindgooApp({ initialUser, initialView });
  const { device, modal, theme, notices, saved, market, chat, offerActions, profileSettings, support, handleFeatureAction } = app;
  const router = useRouter();
  const pathname = usePathname();
  const isMarketPage = initialView === "buy" || initialView === "urgent";

  function postOfferCount(postId: string) {
    const post = device.posts.find((item) => item.id === postId);
    return (post?.offerCount ?? 0) + offerActions.postOffers(postId).length;
  }

  function openPanel(panel: FeaturePanelKey) {
    modal.setSettingsOpen(false);
    modal.setFeaturePanel(panel);
  }

  function handleNoticeClick(notice: AppNotice) {
    notices.markNoticeRead(notice.id);
    if (notice.postId) market.openPost(notice.postId);
  }

  function goHome() {
    if (pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
    else router.push("/");
  }

  function goToMarket(type: PostType) {
    router.push(type === "buy" ? "/buy" : "/urgent");
  }

  return (
    <main className={`findgoo theme-${device.theme}`} id="top">
      <SiteHeader
        profileImage={device.profileImage}
        nickname={device.nickname}
        installPrompt={app.installPrompt}
        installApp={app.installApp}
        badgeCount={offerActions.pendingIncomingCount + notices.unreadCount}
        onScrollTop={goHome}
        onShowBuy={() => goToMarket("buy")}
        onShowUrgent={() => goToMarket("urgent")}
        onOpenChatList={() => modal.setChatListOpen(true)}
        onOpenSettings={() => modal.setSettingsOpen(true)}
      />

      {isMarketPage ? (
        <MarketSection
          type={market.type}
          onSwitchType={goToMarket}
          filtered={market.filtered}
          regionOnly={market.regionOnly}
          setRegionOnly={market.setRegionOnly}
          searchRegion={market.searchRegion}
          setSearchRegion={market.setSearchRegion}
          maxPrice={market.maxPrice}
          setMaxPrice={market.setMaxPrice}
          sortBy={market.sortBy}
          setSortBy={market.setSortBy}
          category={market.category}
          setCategory={market.setCategory}
          onResetSearch={market.resetSearch}
          savedPostIds={device.savedPostIds}
          onToggleSaved={saved.toggleSaved}
          onOpenPost={market.viewPost}
          postOfferCount={postOfferCount}
          onOpenEditor={(type) => market.setEditor({ open: true, post: null, type })}
        />
      ) : (
        <HomeOverview
          region={device.region}
          activeTheme={theme.activeTheme}
          nextTheme={theme.nextTheme}
          onCycleTheme={theme.cycleTheme}
          query={market.query}
          setQuery={market.setQuery}
          onCreatePost={(type) => market.setEditor({ open: true, post: null, type })}
          chatCount={chat.chatPosts.length}
          pendingIncomingCount={offerActions.pendingIncomingCount}
          outgoingPendingCount={offerActions.outgoingOffers.filter((offer) => offer.status === "pending").length}
          savedUrgentCount={saved.savedUrgentPosts.length}
          onOpenChatList={() => modal.setChatListOpen(true)}
          onOpenTrade={() => modal.setTradeOpen(true)}
          onOpenSettings={() => modal.setSettingsOpen(true)}
          onOpenFeaturePanel={(panel) => modal.setFeaturePanel(panel)}
        />
      )}

      <MobileNav
        activeNav={modal.activeNav}
        onHome={goHome}
        onUrgent={() => goToMarket("urgent")}
        onCreate={() => { modal.setActiveNav("create"); market.setEditor({ open: true, post: null, type: market.type }); }}
        onChat={() => { modal.setActiveNav("chat"); modal.setChatListOpen(true); }}
        onMy={() => { modal.setActiveNav("my"); modal.setSettingsOpen(true); }}
        chatBadge={chat.chatPosts.length}
        myBadge={offerActions.pendingIncomingCount + notices.unreadCount}
      />

      {market.selected && (
        <PostDetailModal
          post={market.selected}
          postOffers={offerActions.postOffers}
          onClose={() => market.setSelected(null)}
          flash={app.flash}
          onChangeStatus={market.changePostStatus}
          onEditPost={(post) => { market.setEditor({ open: true, post, type: post.type }); market.setSelected(null); }}
          onRemovePost={market.removePost}
          onAcceptOffer={offerActions.acceptOffer}
          onOpenChat={chat.openChat}
          onSubmitOffer={offerActions.submitOffer}
          onCancelOffer={offerActions.cancelOffer}
          nickname={device.nickname}
        />
      )}

      {modal.tradeOpen && (
        <TradeCenterModal
          onClose={() => modal.setTradeOpen(false)}
          posts={device.posts}
          incomingOffers={offerActions.incomingOffers}
          outgoingOffers={offerActions.outgoingOffers}
          onReject={offerActions.rejectOffer}
          onAccept={offerActions.acceptOffer}
          onOpenChat={chat.openChat}
          onEdit={offerActions.editOffer}
          onCancel={offerActions.cancelOffer}
        />
      )}

      {modal.chatListOpen && (
        <ChatListModal
          onClose={() => modal.setChatListOpen(false)}
          chatPosts={chat.chatPosts}
          incomingOffers={offerActions.incomingOffers}
          messages={device.messages}
          onOpenChat={chat.openChat}
          onViewIncomingOffers={() => { modal.setChatListOpen(false); modal.setTradeOpen(true); }}
        />
      )}

      {market.editor.open && (
        <PostEditorModal editor={market.editor} setEditor={market.setEditor} region={device.region} onSubmit={market.savePost} />
      )}

      {chat.chatPost && (
        <ChatModal
          chatPost={chat.chatPost}
          chatCounterparty={chat.chatCounterparty}
          chatOffer={chat.chatOffer}
          activeMessages={chat.activeMessages}
          onClose={() => chat.setChatPost(null)}
          onOpenDealPanel={() => modal.setFeaturePanel("deal")}
          onSendMessage={chat.sendMessage}
          onSendImage={chat.sendChatImage}
        />
      )}

      {modal.settingsOpen && (
        <MyPageModal
          onClose={() => modal.setSettingsOpen(false)}
          unreadCount={notices.unreadCount}
          onMarkAllRead={notices.markAllRead}
          profileImage={device.profileImage}
          nickname={device.nickname}
          setNickname={device.setNickname}
          onChangeProfileImage={profileSettings.changeProfileImage}
          onSaveSettings={profileSettings.saveSettings}
          chatPosts={chat.chatPosts}
          pendingIncomingCount={offerActions.pendingIncomingCount}
          savedPosts={saved.savedPosts}
          messages={device.messages}
          notices={device.notices}
          pushEnabled={device.pushEnabled}
          onNoticeClick={handleNoticeClick}
          onTestPush={() => notices.deliverNotice("찾구 테스트 알림", "앱 알림이 정상적으로 연결됐어요.", "system")}
          onRequestPush={notices.requestPushNotifications}
          onOpenChat={chat.openChat}
          onOpenPost={market.openPost}
          buyPostCount={market.myPosts.filter((post) => post.type === "buy").length}
          urgentPostCount={market.myPosts.filter((post) => post.type === "urgent").length}
          region={device.region}
          setRegion={device.setRegion}
          activityRegions={device.activityRegions}
          onToggleRegion={(region) => profileSettings.toggleChoice(region, device.activityRegions, device.setActivityRegions, 3)}
          interestCategories={device.interestCategories}
          onToggleInterest={(category) => profileSettings.toggleChoice(category, device.interestCategories, device.setInterestCategories)}
          keywords={device.keywords}
          onAddKeyword={profileSettings.addKeyword}
          onRemoveKeyword={(keyword) => device.setKeywords((items) => items.filter((item) => item !== keyword))}
          theme={device.theme}
          activeThemeLabel={theme.activeTheme.label}
          setTheme={device.setTheme}
          onOpenTrade={() => { modal.setSettingsOpen(false); modal.setTradeOpen(true); }}
          onOpenChatList={() => { modal.setSettingsOpen(false); modal.setChatListOpen(true); }}
          onOpenPanel={openPanel}
          onLogout={() => handleFeatureAction("my-logout", "로그아웃")}
          onWithdraw={() => handleFeatureAction("my-withdraw", "회원 탈퇴")}
        />
      )}

      {/* [전체 기능 관리] */}
      {modal.featurePanel && <FeaturePanel panel={modal.featurePanel} viewer={app.viewer} onClose={() => modal.setFeaturePanel(null)} onAction={handleFeatureAction} />}

      {modal.supportOpen && <SupportModal onClose={() => modal.setSupportOpen(false)} onSubmit={support.submitSupport} />}

      {modal.termsOpen && <TermsModal onClose={() => modal.setTermsOpen(false)} />}

      <Toast message={app.toast} />
    </main>
  );
}
