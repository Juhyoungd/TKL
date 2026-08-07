"use client";

import type { AppNotice } from "@/src/types/findgoo";

type NotificationsSectionProps = {
  notices: AppNotice[];
  unreadCount: number;
  pushEnabled: boolean;
  onMarkAllRead: () => void;
  onNoticeClick: (notice: AppNotice) => void;
  onTestPush: () => void;
  onRequestPush: () => void;
};

export function NotificationsSection({ notices, unreadCount, pushEnabled, onMarkAllRead, onNoticeClick, onTestPush, onRequestPush }: NotificationsSectionProps) {
  return (
    <section className="my-section">
      <div className="my-title">
        <div><small>NOTIFICATIONS</small><h3>알림</h3></div>
        {unreadCount > 0 && <button onClick={onMarkAllRead}>모두 읽음</button>}
      </div>
      <div className="notice-list">
        {notices.slice(0, 5).map((notice) => (
          <button className={notice.read ? "read" : ""} key={notice.id} onClick={() => onNoticeClick(notice)}>
            <span>{notice.kind === "chat" ? "말" : notice.kind === "keyword" ? "#" : notice.kind === "offer" ? "⇄" : "✓"}</span>
            <div><strong>{notice.title}</strong><small>{notice.body}</small></div>
            <time>{notice.time}</time>
          </button>
        ))}
        {!notices.length && <p className="my-empty">새 알림이 없어요.</p>}
      </div>
      <div className="push-card">
        <span>{pushEnabled ? "✓" : "♧"}</span>
        <div><strong>앱 푸시 알림</strong><small>거래 요청·수락, 1:1 채팅, 관심 키워드를 알려드려요.</small></div>
        {pushEnabled ? <button onClick={onTestPush}>테스트</button> : <button onClick={onRequestPush}>알림 켜기</button>}
      </div>
    </section>
  );
}
