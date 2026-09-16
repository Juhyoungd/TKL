"use client";

import { useRouter } from "next/navigation";
import { useAppData } from "@/src/state/AppDataProvider";
import type { Offer, Post } from "@/src/types/findgoo";

// [판매 제안] 받은/보낸 제안 조회와 제안 보내기·수정·취소·수락·거절을 담당합니다.
// 수락 시 채팅방이 열리면 바로 /chat/[id]로 이동합니다.
export function useOfferActions() {
  const appData = useAppData();
  const router = useRouter();

  function postOffers(postId: string) {
    return appData.offers.filter((offer) => offer.postId === postId);
  }

  async function submitOffer(postId: string, nickname: string, price: number, message: string) {
    if (appData.offers.some((offer) => offer.postId === postId && offer.direction === "outgoing" && offer.status === "pending")) {
      return { error: "이미 보낸 제안이 있어요." };
    }
    return appData.addOffer({ postId, nickname, price, message });
  }

  async function editOffer(offer: Offer) {
    const nextPrice = Number(window.prompt("수정할 제안 가격을 입력하세요.", String(offer.price)));
    if (!Number.isFinite(nextPrice) || nextPrice < 1000) return { error: null };
    const nextMessage = window.prompt("수정할 제안 메시지를 입력하세요.", offer.message)?.trim();
    if (!nextMessage) return { error: null };
    return appData.editOffer(offer.id, nextPrice, nextMessage);
  }

  async function rejectOffer(offerId: string) {
    return appData.updateOfferStatus(offerId, "rejected");
  }

  async function acceptOffer(offer: Offer) {
    const { conversation, error } = await appData.acceptOfferAndOpenChat(offer);
    if (!error && conversation) router.push(`/chat/${conversation.id}`);
    return { error };
  }

  async function cancelOffer(offerId: string) {
    return appData.updateOfferStatus(offerId, "canceled");
  }

  // 이미 수락된 제안에서 그 대화방으로 이동합니다.
  function goToOfferChat(offer: Offer) {
    const conversation = appData.conversations.find((item) => {
      if (item.postId !== offer.postId) return false;
      return offer.direction === "incoming" ? item.counterpartyId === offer.offererId : true;
    });
    if (conversation) router.push(`/chat/${conversation.id}`);
  }

  // 내(구매자)가 보낸 제안이 수락된 글에서 대화방을 찾아 이동합니다(없으면 새로 만듭니다).
  async function openChatForPost(post: Post) {
    const { conversation, error } = await appData.startOrGetConversation(post);
    if (!error && conversation) router.push(`/chat/${conversation.id}`);
    return { error };
  }

  const incomingOffers = appData.offers.filter((offer) => offer.direction === "incoming" && offer.status !== "canceled" && offer.status !== "rejected");
  const outgoingOffers = appData.offers.filter((offer) => offer.direction === "outgoing" && offer.status !== "canceled");
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
    goToOfferChat,
    openChatForPost,
  };
}
