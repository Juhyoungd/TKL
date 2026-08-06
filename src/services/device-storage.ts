// [기기 저장] 공개 베타의 임시 상태만 담당합니다. 정식 회원 데이터는 API/D1이 기준입니다.
export const storageKeys = {
  posts: "findgoo-app-posts-v2",
  offers: "findgoo-app-offers-v2",
  chats: "findgoo-app-chats-v2",
  notices: "findgoo-app-notices-v2",
  saved: "findgoo-app-saved-v2",
  regions: "findgoo-app-activity-regions",
  categories: "findgoo-app-interest-categories",
  keywords: "findgoo-app-keywords",
  profileImage: "findgoo-app-profile-image",
  push: "findgoo-app-push",
  region: "findgoo-app-region",
  nickname: "findgoo-app-nickname",
  theme: "findgoo-color-theme",
} as const;

export function readDeviceState<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

export function writeDeviceState(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage can be disabled */ }
}
