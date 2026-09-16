"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { readDeviceState, storageKeys, writeDeviceState } from "@/src/services/device-storage";
import { appDefaults } from "@/src/store/app-store";
import { themeOptions } from "@/src/theme/palettes";
import { useAppData } from "@/src/state/AppDataProvider";
import type { ThemeId } from "@/src/types/findgoo";

type LocalPreferencesContextValue = {
  activityRegions: string[];
  setActivityRegions: Dispatch<SetStateAction<string[]>>;
  interestCategories: string[];
  setInterestCategories: Dispatch<SetStateAction<string[]>>;
  keywords: string[];
  setKeywords: Dispatch<SetStateAction<string[]>>;
  pushEnabled: boolean;
  requestPushNotifications: () => Promise<void>;
  deliverTestNotice: () => void;
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
};

const LocalPreferencesContext = createContext<LocalPreferencesContextValue | null>(null);

function showBrowserNotification(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const options = { body, icon: "/og.png", badge: "/og.png" };
  if ("serviceWorker" in navigator) navigator.serviceWorker.ready.then((registration) => registration.showNotification(title, options)).catch(() => new Notification(title, options));
  else new Notification(title, options);
}

// [기기 저장] Supabase에 대응 테이블이 없는 코스메틱 설정(앱 색상·관심 지역·관심 카테고리·
// 키워드 알림·푸시 권한)만 이 기기에 저장합니다. 앱 전역에서 한 번만 마운트되어(AppShell)
// 새 알림이 오면 페이지에 상관없이 브라우저 알림을 띄울 수 있습니다.
export function LocalPreferencesProvider({ children }: { children: ReactNode }) {
  const appData = useAppData();
  const [activityRegions, setActivityRegions] = useState<string[]>([...appDefaults.activityRegions]);
  const [interestCategories, setInterestCategories] = useState<string[]>([...appDefaults.interestCategories]);
  const [keywords, setKeywords] = useState<string[]>([...appDefaults.keywords]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [theme, setTheme] = useState<ThemeId>("dusk");
  const [ready, setReady] = useState(false);

  // 서버 렌더링 시점에는 localStorage가 없어서 안전한 기본값으로 먼저 그리고,
  // 마운트된 뒤(브라우저에서만) 실제 저장값으로 갱신해 하이드레이션 오류를 피합니다.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setActivityRegions(readDeviceState(storageKeys.regions, [...appDefaults.activityRegions]));
    setInterestCategories(readDeviceState(storageKeys.categories, [...appDefaults.interestCategories]));
    setKeywords(readDeviceState(storageKeys.keywords, [...appDefaults.keywords]));
    setPushEnabled(readDeviceState(storageKeys.push, false) && "Notification" in window && Notification.permission === "granted");
    const storedTheme = readDeviceState<ThemeId>(storageKeys.theme, "dusk");
    setTheme(themeOptions.some((option) => option.id === storedTheme) ? storedTheme : "dusk");
    setReady(true);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => { if (ready) writeDeviceState(storageKeys.regions, activityRegions); }, [activityRegions, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.categories, interestCategories); }, [interestCategories, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.keywords, keywords); }, [keywords, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.push, pushEnabled); }, [pushEnabled, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.theme, theme); }, [theme, ready]);

  // 새 알림이 실시간으로 도착하면(내가 지금 만든 게 아니라 서버에서 온 것) 어느 페이지에 있든 브라우저 알림을 보여줍니다.
  const seenIdsRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (seenIdsRef.current === null || !pushEnabled) {
      seenIdsRef.current = new Set(appData.notices.map((notice) => notice.id));
      return;
    }
    for (const notice of appData.notices) {
      if (!seenIdsRef.current.has(notice.id)) showBrowserNotification(notice.title, notice.body);
    }
    seenIdsRef.current = new Set(appData.notices.map((notice) => notice.id));
  }, [appData.notices, pushEnabled]);

  const requestPushNotifications = useCallback(async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    const enabled = permission === "granted";
    setPushEnabled(enabled);
    if (enabled) showBrowserNotification("찾구 알림을 시작했어요", "거래 제안, 수락, 채팅 소식을 알려드릴게요.");
  }, []);

  const deliverTestNotice = useCallback(() => {
    showBrowserNotification("찾구 테스트 알림", "앱 알림이 정상적으로 연결됐어요.");
  }, []);

  const value = useMemo<LocalPreferencesContextValue>(() => ({
    activityRegions, setActivityRegions,
    interestCategories, setInterestCategories,
    keywords, setKeywords,
    pushEnabled, requestPushNotifications, deliverTestNotice,
    theme, setTheme,
  }), [activityRegions, interestCategories, keywords, pushEnabled, requestPushNotifications, deliverTestNotice, theme]);

  return <LocalPreferencesContext.Provider value={value}>{children}</LocalPreferencesContext.Provider>;
}

export function useLocalPreferences() {
  const context = useContext(LocalPreferencesContext);
  if (!context) throw new Error("useLocalPreferences는 LocalPreferencesProvider 안에서만 사용할 수 있어요.");
  return context;
}
