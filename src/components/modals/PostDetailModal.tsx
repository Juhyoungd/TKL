"use client";

import type { FormEvent } from "react";
import { won } from "@/src/utils/format";
import type { Offer, Post } from "@/src/types/findgoo";

type PostDetailModalProps = {
  post: Post;
  postOffers: (postId: string) => Offer[];
  onClose: () => void;
  flash: (message: string) => void;
  onChangeStatus: (post: Post, status: Post["status"]) => void;
  onEditPost: (post: Post) => void;
  onRemovePost: (post: Post) => void;
  onAcceptOffer: (offer: Offer) => void;
  onOpenChat: (post: Post) => void;
  onSubmitOffer: (event: FormEvent<HTMLFormElement>) => void;
  onCancelOffer: (offerId: string) => void;
  nickname: string;
};

// [구매글 조회] + [급구 조회]
export function PostDetailModal({ post, postOffers, onClose, flash, onChangeStatus, onEditPost, onRemovePost, onAcceptOffer, onOpenChat, onSubmitOffer, onCancelOffer, nickname }: PostDetailModalProps) {
  const offers = postOffers(post.id);

  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <section className="detail-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-handle"></div>
        <header>
          <button onClick={onClose}>←</button>
          <strong>글 상세</strong>
          <button onClick={() => navigator.clipboard?.writeText(location.href).then(() => flash("링크를 복사했어요."))}>↗</button>
        </header>
        <div className="detail-scroll">
          <div className="detail-tags">
            <span className={`post-type ${post.type}`}>{post.type === "buy" ? "구매해요" : "급구"}</span>
            <span className="post-category">{post.category}</span>
            <span className={`post-status ${post.status}`}>{post.status === "open" ? "거래 가능" : post.status === "reserved" ? "진행 중" : "마감"}</span>
            {post.deadline && <b>{post.deadline}</b>}
          </div>
          <h2>{post.title}</h2>
          <div className="author-row">
            <span>{post.author[0]}</span>
            <div><strong>{post.author}</strong><small>{post.region} · 베타 프로필</small></div>
            <b>매너 {post.manner}</b>
          </div>
          <div className="detail-price">
            <div><small>{post.type === "buy" ? "희망 가격" : "지원 금액"}</small><strong>{won(post.price)}</strong></div>
            <span>제안 {post.offerCount + offers.length} · 조회 {post.views}</span>
          </div>
          <div className="detail-copy"><h3>상세 내용</h3><p>{post.description}</p></div>

          {post.mine ? (
            <>
              {/* [거래 상태 변경] + [급구 마감] */}
              <div className="status-actions">
                <button className={post.status === "open" ? "active" : ""} onClick={() => onChangeStatus(post, "open")}>거래 가능</button>
                <button className={post.status === "reserved" ? "active" : ""} onClick={() => onChangeStatus(post, "reserved")}>진행 중</button>
                <button className={post.status === "closed" ? "active" : ""} onClick={() => onChangeStatus(post, "closed")}>{post.type === "urgent" ? "급구 마감" : "거래 완료"}</button>
              </div>
              <div className="owner-actions">
                <button onClick={() => onEditPost(post)}>수정</button>
                <button onClick={() => onRemovePost(post)}>삭제</button>
              </div>
              <div className="received-offers">
                <h3>받은 제안</h3>
                {offers.filter((offer) => offer.direction === "incoming" && offer.status !== "canceled").map((offer) => (
                  <div key={offer.id}>
                    <span>{offer.nickname[0]}</span>
                    <p><strong>{offer.nickname} · {won(offer.price)}</strong><small>{offer.message}</small></p>
                    {offer.status === "pending" ? <button onClick={() => onAcceptOffer(offer)}>이 제안으로 거래</button> : <button onClick={() => onOpenChat(post)}>1:1 채팅</button>}
                  </div>
                ))}
                {!offers.some((offer) => offer.direction === "incoming" && offer.status !== "canceled") && <p className="offer-empty">아직 받은 제안이 없어요.</p>}
              </div>
            </>
          ) : (
            <PostDetailBuyerPanel post={post} offers={offers} nickname={nickname} onOpenChat={onOpenChat} onSubmitOffer={onSubmitOffer} onCancelOffer={onCancelOffer} />
          )}
        </div>
      </section>
    </div>
  );
}

type PostDetailBuyerPanelProps = {
  post: Post;
  offers: Offer[];
  nickname: string;
  onOpenChat: (post: Post) => void;
  onSubmitOffer: (event: FormEvent<HTMLFormElement>) => void;
  onCancelOffer: (offerId: string) => void;
};

// 글쓴이가 아닌 방문자에게 보여줄 영역: 거래 성사/제안 대기/마감/제안 폼 중 하나
function PostDetailBuyerPanel({ post, offers, nickname, onOpenChat, onSubmitOffer, onCancelOffer }: PostDetailBuyerPanelProps) {
  const sentOffer = offers.find((offer) => offer.direction === "outgoing" && offer.status !== "canceled");

  if (sentOffer?.status === "accepted") {
    return (
      <div className="deal-confirmed">
        <span>✓</span>
        <div><strong>거래가 성사됐어요</strong><small>이제 두 사람만의 채팅방에서 약속을 정하세요.</small></div>
        <button onClick={() => onOpenChat(post)}>1:1 채팅 열기</button>
      </div>
    );
  }

  if (sentOffer) {
    return (
      <div className="offer-waiting">
        <span>제안 검토 중</span>
        <strong>{won(sentOffer.price)}</strong>
        <p>상대가 이 제안을 선택하면 1:1 채팅방이 열립니다.</p>
        <button onClick={() => onCancelOffer(sentOffer.id)}>제안 취소</button>
      </div>
    );
  }

  if (post.status === "closed") {
    return (
      <div className="closed-post-note">
        <span>✓</span>
        <div><strong>{post.type === "urgent" ? "마감된 급구예요" : "완료된 구매글이에요"}</strong><small>새 제안과 지원을 받지 않습니다.</small></div>
      </div>
    );
  }

  return (
    <form className="offer-form" onSubmit={onSubmitOffer}>
      <h3>{post.type === "buy" ? "판매 제안하기" : "지원하기"}</h3>
      <label><span>닉네임</span><input name="nickname" defaultValue={nickname} minLength={2} required /></label>
      <label><span>{post.type === "buy" ? "제안 가격" : "지원 금액"}</span><div><input name="price" type="number" min="1000" step="1000" defaultValue={post.price} required /><b>원</b></div></label>
      <label><span>메시지</span><textarea name="message" minLength={3} required placeholder={post.type === "buy" ? "물건 상태와 거래 가능 시간을 알려주세요." : "가능한 시간과 경험을 알려주세요."} /></label>
      <div className="trade-gate"><span>🔒</span><p><strong>채팅은 거래 성사 후 열려요</strong>글쓴이가 제안을 선택하기 전에는 서로 연락할 수 없습니다.</p></div>
      <button type="submit">{post.type === "buy" ? "판매 제안 보내기" : "지원 보내기"}</button>
    </form>
  );
}
