"use client";

import type { Conversation } from "@/src/types/findgoo";

type RecentActivitySectionProps = {
  conversations: Conversation[];
  pendingIncomingCount: number;
  onOpenChat: (conversation: Conversation) => void;
  onOpenTrade: () => void;
};

export function RecentActivitySection({ conversations, pendingIncomingCount, onOpenChat, onOpenTrade }: RecentActivitySectionProps) {
  return (
    <section className="my-section">
      <div className="my-title"><div><small>ACTIVITY</small><h3>최근 채팅과 제안</h3></div><button onClick={onOpenTrade}>전체 제안 ›</button></div>
      {conversations.slice(0, 2).map((conversation) => (
        <button className="my-chat-row" key={conversation.id} onClick={() => onOpenChat(conversation)}>
          <span>{conversation.counterpartyName[0]}</span>
          <div><strong>{conversation.counterpartyName}</strong><small>{conversation.lastMessage ?? conversation.postTitle}</small></div>
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
