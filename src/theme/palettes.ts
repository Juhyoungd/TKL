import type { ThemeId } from "@/src/types/findgoo";

// [앱 색상]
// 색상 이름, 아이콘, 마이페이지 미리보기 색을 한 곳에서 관리합니다.
export const themeOptions: ReadonlyArray<{
  id: ThemeId;
  label: string;
  icon: string;
  colors: readonly [string, string, string];
}> = [
  { id: "dusk", label: "라벤더", icon: "◐", colors: ["#746391", "#caddea", "#f4e8bd"] },
  { id: "warm", label: "살구", icon: "●", colors: ["#e9866c", "#c9d9cd", "#d5caea"] },
  { id: "ocean", label: "블루민트", icon: "≈", colors: ["#4f7890", "#b7d9d4", "#f5e7c8"] },
  { id: "forest", label: "포레스트", icon: "♣", colors: ["#4f6959", "#b8c9a9", "#e8d7b7"] },
  { id: "berry", label: "로즈베리", icon: "✦", colors: ["#9a5f73", "#e3b6c2", "#d8ccec"] },
];
