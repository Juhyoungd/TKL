"use client";

import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { resolveImageSource } from "@/src/services/image-upload";
import type { Viewer } from "@/src/types/findgoo";

type UseProfileSettingsArgs = {
  keywords: string[];
  setKeywords: Dispatch<SetStateAction<string[]>>;
  setProfileImage: Dispatch<SetStateAction<string>>;
  setSettingsOpen: Dispatch<SetStateAction<boolean>>;
  viewer: Viewer;
  flash: (message: string) => void;
};

// [마이페이지] 프로필 사진, 관심 지역/카테고리 선택, 키워드 알림 등록/저장을 담당합니다.
export function useProfileSettings({ keywords, setKeywords, setProfileImage, setSettingsOpen, viewer, flash }: UseProfileSettingsArgs) {
  function toggleChoice(value: string, values: string[], update: (items: string[]) => void, limit = 5) {
    if (values.includes(value)) update(values.filter((item) => item !== value));
    else if (values.length < limit) update([...values, value]);
    else flash(`최대 ${limit}개까지 선택할 수 있어요.`);
  }

  function addKeyword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const keyword = String(form.get("keyword")).trim().replace(/^#/, "");
    if (keyword.length < 2) { flash("두 글자 이상 입력해 주세요."); return; }
    if (keywords.some((item) => item.toLowerCase() === keyword.toLowerCase())) { flash("이미 등록한 키워드예요."); return; }
    if (keywords.length >= 8) { flash("키워드는 최대 8개까지 등록할 수 있어요."); return; }
    setKeywords((items) => [keyword, ...items]);
    event.currentTarget.reset();
    flash(`‘${keyword}’ 알림을 등록했어요.`);
  }

  async function changeProfileImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1_500_000) { flash("1.5MB 이하 이미지 파일을 선택해 주세요."); return; }
    try { setProfileImage(await resolveImageSource(file, "profile", viewer)); }
    catch { flash("프로필 사진을 저장하지 못했어요."); }
  }

  function saveSettings() {
    setSettingsOpen(false);
    flash("마이페이지 설정을 저장했어요.");
  }

  return { toggleChoice, addKeyword, changeProfileImage, saveSettings };
}
