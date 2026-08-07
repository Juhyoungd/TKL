"use client";

import { useEffect, useState } from "react";
import { seedMessages, seedNotices, seedOffers, seedPosts } from "@/src/constants/feature-spec";
import { readDeviceState, storageKeys, writeDeviceState } from "@/src/services/device-storage";
import { appDefaults } from "@/src/store/app-store";
import { themeOptions } from "@/src/theme/palettes";
import type { AppNotice, ChatMessage, Offer, Post, ThemeId, Viewer } from "@/src/types/findgoo";

// [기기 저장] 공개 베타의 핵심 데이터(글/제안/채팅/알림/찜/설정)를 기기에 저장하고
// 최초 진입 시 복원합니다. FindgooApp 전체가 공유하는 "원본 상태"를 한곳에 모아
// 다른 훅들은 이 훅이 내려주는 값과 setter만 조합해서 사용합니다.
export function useFindgooDeviceState(initialUser: Viewer) {
  const [posts, setPosts] = useState<Post[]>(seedPosts);
  const [offers, setOffers] = useState<Offer[]>(seedOffers);
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [notices, setNotices] = useState<AppNotice[]>(seedNotices);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([...appDefaults.savedPostIds]);
  const [activityRegions, setActivityRegions] = useState<string[]>([...appDefaults.activityRegions]);
  const [interestCategories, setInterestCategories] = useState<string[]>([...appDefaults.interestCategories]);
  const [keywords, setKeywords] = useState<string[]>([...appDefaults.keywords]);
  const [profileImage, setProfileImage] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [region, setRegion] = useState<string>(appDefaults.region);
  const [nickname, setNickname] = useState<string>(appDefaults.nickname);
  const [theme, setTheme] = useState<ThemeId>("dusk");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPosts(readDeviceState(storageKeys.posts, seedPosts));
    setOffers(readDeviceState(storageKeys.offers, seedOffers));
    setMessages(readDeviceState(storageKeys.chats, seedMessages));
    setNotices(readDeviceState(storageKeys.notices, seedNotices));
    setSavedPostIds(readDeviceState(storageKeys.saved, [...appDefaults.savedPostIds]));
    setActivityRegions(readDeviceState(storageKeys.regions, [...appDefaults.activityRegions]));
    setInterestCategories(readDeviceState(storageKeys.categories, [...appDefaults.interestCategories]));
    setKeywords(readDeviceState(storageKeys.keywords, [...appDefaults.keywords]));
    setProfileImage(readDeviceState(storageKeys.profileImage, ""));
    setPushEnabled(readDeviceState(storageKeys.push, false) && "Notification" in window && Notification.permission === "granted");
    setRegion(readDeviceState(storageKeys.region, appDefaults.region));
    setNickname(initialUser?.displayName ?? readDeviceState(storageKeys.nickname, appDefaults.nickname));
    const storedTheme = readDeviceState<ThemeId>(storageKeys.theme, "dusk");
    setTheme(themeOptions.some((option) => option.id === storedTheme) ? storedTheme : "dusk");
    setReady(true);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (ready) writeDeviceState(storageKeys.posts, posts); }, [posts, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.offers, offers); }, [offers, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.chats, messages); }, [messages, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.notices, notices); }, [notices, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.saved, savedPostIds); }, [ready, savedPostIds]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.regions, activityRegions); }, [activityRegions, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.categories, interestCategories); }, [interestCategories, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.keywords, keywords); }, [keywords, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.profileImage, profileImage); }, [profileImage, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.push, pushEnabled); }, [pushEnabled, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.region, region); }, [ready, region]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.nickname, nickname); }, [nickname, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.theme, theme); }, [ready, theme]);

  return {
    ready,
    posts, setPosts,
    offers, setOffers,
    messages, setMessages,
    notices, setNotices,
    savedPostIds, setSavedPostIds,
    activityRegions, setActivityRegions,
    interestCategories, setInterestCategories,
    keywords, setKeywords,
    profileImage, setProfileImage,
    pushEnabled, setPushEnabled,
    region, setRegion,
    nickname, setNickname,
    theme, setTheme,
  };
}
