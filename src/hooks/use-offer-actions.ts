"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { uid, won } from "@/src/utils/format";
import type { AppNotice, ChatMessage, Offer, Post } from "@/src/types/findgoo";

type UseOfferActionsArgs = {
  posts: Post[];
  offers: Offer[];
  setOffers: Dispatch<SetStateAction<Offer[]>>;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  selected: Post | null;
  setSelected: Dispatch<SetStateAction<Post | null>>;
  setTradeOpen: Dispatch<SetStateAction<boolean>>;
  setChatPost: Dispatch<SetStateAction<Post | null>>;
  setNickname: Dispatch<SetStateAction<string>>;
  deliverNotice: (title: string, body: string, kind: AppNotice["kind"], postId?: string) => void;
  flash: (message: string) => void;
};

// [판매 제안] 받은/보낸 제안 목록과 제안 보내기·수정·취소·수락·거절을 담당합니다.
export function useOfferActions({ posts, offers, setOffers, setMessages, selected, setSelected, setTradeOpen, setChatPost, setNickname, deliverNotice, flash }: UseOfferActionsArgs) {
  function postOffers(postId: string) {
    return offers.filter((offer) => offer.postId === postId);
  }

  function submitOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    if (offers.some((offer) => offer.postId === selected.id && offer.direction === "outgoing" && offer.status === "pending")) {
      flash("이미 보낸 제안이 있어요.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const offer: Offer = { id: uid(), postId: selected.id, nickname: String(form.get("nickname")), price: Number(form.get("price")), message: String(form.get("message")), direction: "outgoing", status: "pending" };
    setOffers((items) => [offer, ...items]);
    setNickname(offer.nickname);
    setSelected(null);
    setTradeOpen(true);
    flash("제안을 보냈어요. 상대가 선택하면 1:1 채팅이 열립니다.");
  }

  // [제안 수정]
  function editOffer(offer: Offer) {
    const nextPrice = Number(window.prompt("수정할 제안 가격을 입력하세요.", String(offer.price)));
    if (!Number.isFinite(nextPrice) || nextPrice < 1000) return;
    const nextMessage = window.prompt("수정할 제안 메시지를 입력하세요.", offer.message)?.trim();
    if (!nextMessage) return;
    setOffers((items) => items.map((item) => item.id === offer.id ? { ...item, price: nextPrice, message: nextMessage } : item));
    flash("제안을 수정했어요.");
  }

  // [제안 거절]
  function rejectOffer(offerId: string) {
    setOffers((items) => items.map((item) => item.id === offerId ? { ...item, status: "rejected" } : item));
    flash("제안을 거절했어요.");
  }

  function acceptOffer(offer: Offer) {
    const post = posts.find((item) => item.id === offer.postId);
    if (!post) return;
    setOffers((items) => items.map((item) => item.id === offer.id ? { ...item, status: "accepted" } : item));
    setMessages((items) => items.some((item) => item.postId === post.id) ? items : [
      ...items,
      { id: uid(), postId: post.id, sender: "partner", text: `${won(offer.price)} 제안을 선택해 주셔서 감사합니다. 거래 시간과 장소를 정해볼까요?`, time: "방금" },
    ]);
    setTradeOpen(false);
    setChatPost(post);
    setSelected(null);
    deliverNotice("거래 요청을 수락했어요", `${offer.nickname}님과 1:1 거래 채팅이 열렸습니다.`, "trade", post.id);
    flash("거래가 성사되어 1:1 채팅방을 열었어요.");
  }

  function cancelOffer(offerId: string) {
    setOffers((items) => items.map((item) => item.id === offerId ? { ...item, status: "canceled" } : item));
    flash("제안을 취소했어요.");
  }

  const incomingOffers = offers.filter((offer) => offer.direction === "incoming" && offer.status !== "canceled" && offer.status !== "rejected");
  const outgoingOffers = offers.filter((offer) => offer.direction === "outgoing" && offer.status !== "canceled");
  const pendingIncomingCount = incomingOffers.filter((offer) => offer.status === "pending").length;

  return {
    incomingOffers,
    outgoingOffers,
    pendingIncomingCount,
    postOffers,
    submitOffer,
    editOffer,
    rejectOffer,
    acceptOffer,
    cancelOffer,
  };
}
