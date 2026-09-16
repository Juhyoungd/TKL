"use client";

import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { useAuth } from "@/src/state/AuthProvider";
import { uploadAvatar } from "@/src/services/image-upload";

type UseProfileSettingsArgs = {
  keywords: string[];
  setKeywords: Dispatch<SetStateAction<string[]>>;
  nicknameDraft: string;
  setNicknameDraft: Dispatch<SetStateAction<string>>;
  flash: (message: string) => void;
};

// [마이페이지] 프로필 사진, 관심 지역/카테고리 선택, 키워드 알림 등록/닉네임 저장을 담당합니다.
export function useProfileSettings({ keywords, setKeywords, nicknameDraft, setNicknameDraft, flash }: UseProfileSettingsArgs) {
  const { session, updateProfile } = useAuth();

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
    flash(`'${keyword}' 알림을 등록했어요.`);
  }

  // [사진 변경] 고르는 즉시 업로드하고 프로필에 반영합니다.
  async function changeProfileImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !session) return;
    if (!file.type.startsWith("image/") || file.size > 1_500_000) { flash("1.5MB 이하 이미지 파일을 선택해 주세요."); return; }
    const { url, error } = await uploadAvatar(file, session.user.id);
    if (error || !url) { flash("프로필 사진을 저장하지 못했어요."); return; }
    const result = await updateProfile({ avatarUrl: url });
    if (result.error) flash("프로필 사진을 저장하지 못했어요.");
    else flash("프로필 사진을 변경했어요.");
  }

  async function saveSettings() {
    const result = await updateProfile({ nickname: nicknameDraft });
    if (result.error) { flash("설정을 저장하지 못했어요."); return; }
    flash("마이페이지 설정을 저장했어요.");
  }

  return { toggleChoice, addKeyword, changeProfileImage, saveSettings, nicknameDraft, setNicknameDraft };
}
