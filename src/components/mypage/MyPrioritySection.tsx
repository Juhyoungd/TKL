"use client";

type MyPrioritySectionProps = {
  chatCount: number;
  pendingIncomingCount: number;
  savedCount: number;
  onOpenChatList: () => void;
  onOpenTrade: () => void;
};

export function MyPrioritySection({ chatCount, pendingIncomingCount, savedCount, onOpenChatList, onOpenTrade }: MyPrioritySectionProps) {
  return (
    <section className="my-priority" aria-label="중요 활동">
      <button onClick={onOpenChatList}><span>●</span><strong>{chatCount}</strong><small>최근 채팅</small></button>
      <button onClick={onOpenTrade}><span>⇄</span><strong>{pendingIncomingCount}</strong><small>받은 제안</small></button>
      <button onClick={() => document.getElementById("saved-all")?.scrollIntoView({ behavior: "smooth" })}><span>♥</span><strong>{savedCount}</strong><small>찜 목록</small></button>
    </section>
  );
}
