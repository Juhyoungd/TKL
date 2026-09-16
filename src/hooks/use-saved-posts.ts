"use client";

import { useAppData } from "@/src/state/AppDataProvider";
import type { Post } from "@/src/types/findgoo";

// [찜 목록] 구매글/급구 찜하기와 찜한 글 목록 파생값을 관리합니다.
export function useSavedPosts({ flash }: { flash: (message: string) => void }) {
  const appData = useAppData();

  function toggleSaved(post: Post) {
    const saved = appData.savedPostIds.includes(post.id);
    appData.toggleSaved(post.id);
    flash(saved ? "찜에서 삭제했어요." : post.type === "urgent" ? "급구를 찜했어요. 마이에서 확인하세요." : "관심글로 저장했어요.");
  }

  const savedPosts = appData.posts.filter((post) => appData.savedPostIds.includes(post.id));
  const savedUrgentPosts = savedPosts.filter((post) => post.type === "urgent");

  return { savedPosts, savedUrgentPosts, toggleSaved };
}
