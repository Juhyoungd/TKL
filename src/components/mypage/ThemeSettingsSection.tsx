"use client";

import { themeOptions } from "@/src/theme/palettes";
import type { ThemeId } from "@/src/types/findgoo";

type ThemeSettingsSectionProps = {
  theme: ThemeId;
  activeThemeLabel: string;
  setTheme: (theme: ThemeId) => void;
};

// [앱 색상]
export function ThemeSettingsSection({ theme, activeThemeLabel, setTheme }: ThemeSettingsSectionProps) {
  return (
    <section className="my-section theme-settings">
      <div className="my-title"><div><small>APP COLOR</small><h3>앱 색상</h3></div><span>{activeThemeLabel} 사용 중</span></div>
      <p className="section-help">다섯 가지 감성 색상 중 원하는 분위기를 골라보세요.</p>
      <div className="theme-picker">
        {themeOptions.map((option) => (
          <button key={option.id} className={theme === option.id ? "selected" : ""} aria-pressed={theme === option.id} onClick={() => setTheme(option.id)}>
            <span className="theme-swatches">{option.colors.map((color) => <i key={color} style={{ background: color }} />)}</span>
            <strong>{option.label}</strong>
            {theme === option.id && <b>✓</b>}
          </button>
        ))}
      </div>
    </section>
  );
}
