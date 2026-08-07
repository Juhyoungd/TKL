"use client";

import { themeOptions } from "@/src/theme/palettes";
import type { ThemeId } from "@/src/types/findgoo";

// [앱 색상] 현재 테마와 순환 전환 로직을 담당합니다. 실제 값 저장은
// use-findgoo-device-state가 맡고, 이 훅은 파생 값과 전환 동작만 제공합니다.
export function useThemePicker(theme: ThemeId, setTheme: (theme: ThemeId) => void) {
  const activeTheme = themeOptions.find((option) => option.id === theme) ?? themeOptions[0];
  const nextTheme = themeOptions[(themeOptions.findIndex((option) => option.id === theme) + 1) % themeOptions.length];

  function cycleTheme() {
    setTheme(nextTheme.id);
  }

  return { activeTheme, nextTheme, cycleTheme };
}
