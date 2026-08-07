"use client";

import type { ChatMessage, Post } from "@/src/types/findgoo";

type RecentActivitySectionProps = {
  chatPosts: Post[];
  messages: ChatMessage[];
  pendingIncomingCount: number;
  onOpenChat: (post: Post) => void;
  onOpenTrade: () => void;
};

export function RecentActivitySection({ chatPosts, messages, pendingIncomingCount, onOpenChat, onOpenTrade }: RecentActivitySectionProps) {
  return (
    <section className="my-section">
      <div className="my-title"><div><small>ACTIVITY</small><h3>최근 채팅과 제안</h3></div><button onClick={onOpenTrade}>전체 제안 ›</button></div>
      {chatPosts.slice(0, 2).map((post) => (
        <button className="my-chat-row" key={post.id} onClick={() => onOpenChat(post)}>
          <span>{post.author[0]}</span>
          <div><strong>{post.author}</strong><small>{messages.filter((message) => message.postId === post.id).at(-1)?.text ?? post.title}</small></div>
          <time>방금</time>
        </button>
      ))}
      {pendingIncomingCount > 0 && (
        <button className="my-offer-alert" onClick={onOpenTrade}>
          <span>새 제안 {pendingIncomingCount}</span><strong>확인이 필요한 거래 요청이 있어요</strong><b>확인 ›</b>
        </button>
      )}
    </section>
  );
}
