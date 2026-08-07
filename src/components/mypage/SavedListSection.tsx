"use client";

import { won } from "@/src/utils/format";
import type { Post } from "@/src/types/findgoo";

type SavedListSectionProps = {
  savedPosts: Post[];
  onOpenPost: (postId: string) => void;
};

// [찜 목록]
export function SavedListSection({ savedPosts, onOpenPost }: SavedListSectionProps) {
  return (
    <section className="my-section" id="saved-all">
      <div className="my-title"><div><small>SAVED</small><h3>찜 목록</h3></div><b>{savedPosts.length}</b></div>
      {savedPosts.map((post) => (
        <button className="saved-urgent-row" key={post.id} onClick={() => onOpenPost(post.id)}>
          <span>{post.type === "urgent" ? "ϟ" : "◎"}</span>
          <div><strong>{post.title}</strong><small>{post.type === "urgent" ? "급구" : "구매글"} · {post.region} · {won(post.price)}</small></div>
          <b>›</b>
        </button>
      ))}
      {!savedPosts.length && <p className="my-empty">글의 하트를 누르면 이곳에 모아볼 수 있어요.</p>}
    </section>
  );
}
