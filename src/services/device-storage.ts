// [기기 저장] Supabase에 대응 테이블이 없는 코스메틱 설정만 담당합니다.
export const storageKeys = {
  regions: "findgoo-app-activity-regions",
  categories: "findgoo-app-interest-categories",
  keywords: "findgoo-app-keywords",
  push: "findgoo-app-push",
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
