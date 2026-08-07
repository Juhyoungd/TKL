"use client";

import type { Dispatch, SetStateAction } from "react";
import { uid } from "@/src/utils/format";
import type { AppNotice } from "@/src/types/findgoo";

type UseNoticesArgs = {
  notices: AppNotice[];
  setNotices: Dispatch<SetStateAction<AppNotice[]>>;
  pushEnabled: boolean;
  setPushEnabled: Dispatch<SetStateAction<boolean>>;
  flash: (message: string) => void;
};

// [알림] 인앱 알림 목록과 브라우저 푸시 알림 권한/발송을 함께 관리합니다.
export function useNotices({ notices, setNotices, pushEnabled, setPushEnabled, flash }: UseNoticesArgs) {
  function deliverNotice(title: string, body: string, kind: AppNotice["kind"], postId?: string, forcePush = false) {
    setNotices((items) => [{ id: uid(), title, body, kind, postId, time: "방금", read: false }, ...items]);
    if ((!pushEnabled && !forcePush) || !("Notification" in window) || Notification.permission !== "granted") return;
    const options = { body, icon: "/og.png", badge: "/og.png", tag: `${kind}-${postId ?? "findgoo"}` };
    if ("serviceWorker" in navigator) navigator.serviceWorker.ready.then((registration) => registration.showNotification(title, options)).catch(() => new Notification(title, options));
    else new Notification(title, options);
  }

  async function requestPushNotifications() {
    if (!("Notification" in window)) { flash("이 기기에서는 알림을 지원하지 않아요."); return; }
    const permission = await Notification.requestPermission();
    const enabled = permission === "granted";
    setPushEnabled(enabled);
    if (enabled) {
      deliverNotice("찾구 알림을 시작했어요", "거래 제안, 수락, 채팅, 관심 키워드 소식을 알려드릴게요.", "system", undefined, true);
      flash("앱 알림을 켰어요.");
    } else flash("기기 설정에서 알림을 허용해 주세요.");
  }

  function markAllRead() {
    setNotices((items) => items.map((notice) => ({ ...notice, read: true })));
  }

  function markNoticeRead(noticeId: string) {
    setNotices((items) => items.map((item) => item.id === noticeId ? { ...item, read: true } : item));
  }

  const unreadCount = notices.filter((notice) => !notice.read).length;

  return { unreadCount, deliverNotice, requestPushNotifications, markAllRead, markNoticeRead };
}
