"use client";

import Link from "next/link";
import { RequireAuth } from "@/src/components/common/RequireAuth";
import { useOfferActions } from "@/src/hooks/use-offer-actions";
import { useAppData } from "@/src/state/AppDataProvider";
import { useToast } from "@/src/state/ToastProvider";
import { won } from "@/src/utils/format";
import type { Offer } from "@/src/types/findgoo";

// [판매 제안 관리] 받은 제안 / 보낸 제안 목록
export default function OffersPage() {
  return (
    <RequireAuth>
      <OffersContent />
    </RequireAuth>
  );
}

function OffersContent() {
  const appData = useAppData();
  const offerActions = useOfferActions();
  const { flash } = useToast();

  async function handleReject(offerId: string) {
    const { error } = await offerActions.rejectOffer(offerId);
    flash(error ?? "제안을 거절했어요.");
  }

  async function handleAccept(offer: Offer) {
    const { error } = await offerActions.acceptOffer(offer);
    if (error) flash(error);
  }

  async function handleCancel(offerId: string) {
    const { error } = await offerActions.cancelOffer(offerId);
    flash(error ?? "제안을 취소했어요.");
  }

  async function handleEdit(offer: Offer) {
    const { error } = await offerActions.editOffer(offer);
    if (error) flash(error);
  }

  return (
    <div className="page-wide">
      <h1 className="page-title">판매 제안 관리</h1>
      <p className="page-subtitle">받은 제안과 보낸 제안을 한눈에 확인하세요.</p>

      <section className="page-card page-section">
        <div className="trade-title"><h3>받은 제안</h3><b>{offerActions.incomingOffers.filter((offer) => offer.status === "pending").length}</b></div>
        {offerActions.incomingOffers.map((offer) => {
          const post = appData.posts.find((item) => item.id === offer.postId);
          if (!post) return null;
          return (
            <article className="trade-card incoming" key={offer.id}>
              <div className="trade-card-top"><span>{offer.nickname[0]}</span><div><strong>{offer.nickname}</strong><small><Link href={`/post/${post.id}`}>{post.title}</Link></small></div><b>{won(offer.price)}</b></div>
              <p>{offer.message}</p>
              {offer.status === "pending"
                ? <div className="offer-decision"><button onClick={() => handleReject(offer.id)}>거절</button><button onClick={() => handleAccept(offer)}>수락하고 거래</button></div>
                : <button onClick={() => offerActions.goToOfferChat(offer)}>성사된 1:1 채팅 열기</button>}
            </article>
          );
        })}
        {!offerActions.incomingOffers.length && <p className="trade-empty">아직 받은 제안이 없어요.</p>}
      </section>

      <section className="page-card page-section">
        <div className="trade-title"><h3>보낸 제안</h3><b>{offerActions.outgoingOffers.length}</b></div>
        {offerActions.outgoingOffers.map((offer) => {
          const post = appData.posts.find((item) => item.id === offer.postId);
          if (!post) return null;
          return (
            <article className="trade-card" key={offer.id}>
              <div className="trade-card-top"><span>{post.author[0]}</span><div><strong>{post.author}</strong><small><Link href={`/post/${post.id}`}>{post.title}</Link></small></div><b>{won(offer.price)}</b></div>
              <p>{offer.message}</p>
              {offer.status === "pending" ? (
                <div className="trade-status"><span>상대방 검토 중</span><div><button onClick={() => handleEdit(offer)}>수정</button><button onClick={() => handleCancel(offer.id)}>취소</button></div></div>
              ) : offer.status === "accepted" ? (
                <button onClick={() => offerActions.goToOfferChat(offer)}>성사된 1:1 채팅 열기</button>
              ) : (
                <div className="offer-result">{offer.status === "rejected" ? "거절된 제안" : "취소된 제안"}</div>
              )}
            </article>
          );
        })}
        {!offerActions.outgoingOffers.length && <p className="trade-empty">아직 보낸 제안이 없어요.</p>}
      </section>
    </div>
  );
}
