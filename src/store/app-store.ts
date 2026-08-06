import type { BottomNavKey, InitialView } from "@/src/types/findgoo";

// [앱 기본 상태]
export const appDefaults = {
  savedPostIds: ["urgent-line", "buy-bag"],
  activityRegions: ["성수동1가", "성수동2가"],
  interestCategories: ["디지털", "심부름"],
  keywords: ["아이패드", "팝업"],
  region: "성수동1가",
  nickname: "베타사용자",
} as const;

export function initialNavForView(view: InitialView): BottomNavKey {
  if (view === "urgent") return "urgent";
  if (view === "chat") return "chat";
  if (view === "profile") return "my";
  return "home";
}
