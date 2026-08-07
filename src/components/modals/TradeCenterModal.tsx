"use client";

import { won } from "@/src/utils/format";
import type { Offer, Post } from "@/src/types/findgoo";

type TradeCenterModalProps = {
  onClose: () => void;
  posts: Post[];
  incomingOffers: Offer[];
  outgoingOffers: Offer[];
  onReject: (offerId: string) => void;
  onAccept: (offer: Offer) => void;
  onOpenChat: (post: Post) => void;
  onEdit: (offer: Offer) => void;
  onCancel: (offerId: string) => void;
};

// [판매 제안 관리] 받은 제안 / 보낸 제안 목록
export function TradeCenterModal({ onClose, posts, incomingOffers, outgoingOffers, onReject, onAccept, onOpenChat, onEdit, onCancel }: TradeCenterModalProps) {
  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <section className="trade-center" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-handle"></div>
        <header><button onClick={onClose}>×</button><strong>판매 제안 관리</strong><span></span></header>
        <div className="trade-scroll">
          {/* [받은 제안] */}
          <section>
            <div className="trade-title"><h3>받은 제안</h3><b>{incomingOffers.filter((item) => item.status === "pending").length}</b></div>
            {incomingOffers.map((offer) => {
              const post = posts.find((item) => item.id === offer.postId);
              if (!post) return null;
              return (
                <article className="trade-card incoming" key={offer.id}>
                  <div className="trade-card-top"><span>{offer.nickname[0]}</span><div><strong>{offer.nickname}</strong><small>{post.title}</small></div><b>{won(offer.price)}</b></div>
                  <p>{offer.message}</p>
                  {offer.status === "pending"
                    ? <div className="offer-decision"><button onClick={() => onReject(offer.id)}>거절</button><button onClick={() => onAccept(offer)}>수락하고 거래</button></div>
                    : <button onClick={() => onOpenChat(post)}>성사된 1:1 채팅 열기</button>}
                </article>
              );
            })}
          </section>
          {/* [보낸 제안] */}
          <section>
            <div className="trade-title"><h3>보낸 제안</h3><b>{outgoingOffers.length}</b></div>
            {outgoingOffers.map((offer) => {
              const post = posts.find((item) => item.id === offer.postId);
              if (!post) return null;
              return (
                <article className="trade-card" key={offer.id}>
                  <div className="trade-card-top"><span>{post.author[0]}</span><div><strong>{post.author}</strong><small>{post.title}</small></div><b>{won(offer.price)}</b></div>
                  <p>{offer.message}</p>
                  {offer.status === "pending" ? (
                    <div className="trade-status"><span>상대방 검토 중</span><div><button onClick={() => onEdit(offer)}>수정</button><button onClick={() => onCancel(offer.id)}>취소</button></div></div>
                  ) : offer.status === "accepted" ? (
                    <button onClick={() => onOpenChat(post)}>성사된 1:1 채팅 열기</button>
                  ) : (
                    <div className="offer-result">{offer.status === "rejected" ? "거절된 제안" : "취소된 제안"}</div>
                  )}
                </article>
              );
            })}
            {!outgoingOffers.length && <div className="trade-empty">아직 보낸 제안이 없어요.</div>}
          </section>
        </div>
      </section>
    </div>
  );
}
