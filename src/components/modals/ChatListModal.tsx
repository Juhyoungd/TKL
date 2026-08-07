"use client";

import type { ChatMessage, Offer, Post } from "@/src/types/findgoo";

type ChatListModalProps = {
  onClose: () => void;
  chatPosts: Post[];
  incomingOffers: Offer[];
  messages: ChatMessage[];
  onOpenChat: (post: Post) => void;
  onViewIncomingOffers: () => void;
};

// [1:1 거래 채팅 목록] 거래가 성사된 상대와의 채팅방 목록
export function ChatListModal({ onClose, chatPosts, incomingOffers, messages, onOpenChat, onViewIncomingOffers }: ChatListModalProps) {
  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <section className="trade-center chat-list" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-handle"></div>
        <header><button onClick={onClose}>×</button><strong>1:1 거래 채팅</strong><span></span></header>
        <div className="trade-scroll">
          <div className="chat-list-note"><span>🔒</span><p><strong>거래가 성사된 상대만 표시돼요</strong><small>제안 단계에서는 채팅이 열리지 않습니다.</small></p></div>
          {chatPosts.map((post) => (
            <button className="chat-thread" key={post.id} onClick={() => onOpenChat(post)}>
              <span>{post.mine ? incomingOffers.find((offer) => offer.postId === post.id)?.nickname?.[0] ?? "상" : post.author[0]}</span>
              <div><strong>{post.mine ? incomingOffers.find((offer) => offer.postId === post.id)?.nickname ?? "거래 상대" : post.author}</strong><small>{post.title}</small></div>
              <p>{messages.filter((message) => message.postId === post.id).at(-1)?.text ?? "거래 채팅을 시작하세요."}</p>
              <b>›</b>
            </button>
          ))}
          {!chatPosts.length && (
            <div className="chat-list-empty">
              <span>말풍선</span>
              <strong>열린 거래 채팅이 없어요</strong>
              <p>제안이 선택되어 거래가 성사되면 이곳에 1:1 채팅방이 생깁니다.</p>
              <button onClick={onViewIncomingOffers}>받은 제안 보기</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
