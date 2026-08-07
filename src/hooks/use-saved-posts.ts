"use client";

import type { Dispatch, SetStateAction } from "react";
import type { Post } from "@/src/types/findgoo";

type UseSavedPostsArgs = {
  posts: Post[];
  savedPostIds: string[];
  setSavedPostIds: Dispatch<SetStateAction<string[]>>;
  flash: (message: string) => void;
};

// [찜 목록] 구매글/급구 찜하기와 찜한 글 목록 파생값을 관리합니다.
export function useSavedPosts({ posts, savedPostIds, setSavedPostIds, flash }: UseSavedPostsArgs) {
  function toggleSaved(post: Post) {
    const saved = savedPostIds.includes(post.id);
    setSavedPostIds((items) => saved ? items.filter((id) => id !== post.id) : [post.id, ...items]);
    flash(saved ? "찜에서 삭제했어요." : post.type === "urgent" ? "급구를 찜했어요. 마이에서 확인하세요." : "관심글로 저장했어요.");
  }

  const savedPosts = posts.filter((post) => savedPostIds.includes(post.id));
  const savedUrgentPosts = posts.filter((post) => post.type === "urgent" && savedPostIds.includes(post.id));

  return { savedPosts, savedUrgentPosts, toggleSaved };
}
