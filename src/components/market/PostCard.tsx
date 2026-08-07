"use client";

import { won } from "@/src/utils/format";
import type { Post } from "@/src/types/findgoo";

type PostCardProps = {
  post: Post;
  saved: boolean;
  totalOfferCount: number;
  onOpen: (post: Post) => void;
  onToggleSaved: (post: Post) => void;
};

// [구매글] + [급구] 목록에 나오는 카드 한 장
export function PostCard({ post, saved, totalOfferCount, onOpen, onToggleSaved }: PostCardProps) {
  return (
    <article className={`post-card ${post.type} status-${post.status}`} onClick={() => onOpen(post)}>
      <div className="post-head">
        <div>
          <span className={`post-type ${post.type}`}>{post.type === "buy" ? "구매해요" : "급구"}</span>
          <span className="post-category">{post.category}</span>
          <span className={`post-status ${post.status}`}>{post.status === "open" ? "거래 가능" : post.status === "reserved" ? "진행 중" : "마감"}</span>
        </div>
        <button className={saved ? "saved" : ""} aria-label={saved ? "찜 취소" : "찜하기"} onClick={(event) => { event.stopPropagation(); onToggleSaved(post); }}>{saved ? "♥" : "♡"}</button>
      </div>
      <h3>{post.title}</h3>
      <p>{post.description}</p>
      <div className="post-info"><span>⌖ {post.region}</span><span>·</span><span>{post.created}</span>{post.deadline && <span className="deadline">{post.deadline}</span>}</div>
      <div className="post-bottom">
        <div><small>{post.type === "buy" ? "희망 가격" : "지원 금액"}</small><strong>{won(post.price)}</strong></div>
        <div className="offer-bubble"><b>{totalOfferCount}</b><span>{post.type === "buy" ? "개의 제안" : "명 지원"}</span><i>→</i></div>
      </div>
    </article>
  );
}
