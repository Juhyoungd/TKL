"use client";

import { useState } from "react";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { resolveImageSource } from "@/src/services/image-upload";
import { uid } from "@/src/utils/format";
import type { AppNotice, ChatMessage, Offer, Post, Viewer } from "@/src/types/findgoo";

type UseChatArgs = {
  posts: Post[];
  offers: Offer[];
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  viewer: Viewer;
  setSelected: Dispatch<SetStateAction<Post | null>>;
  setTradeOpen: Dispatch<SetStateAction<boolean>>;
  setChatListOpen: Dispatch<SetStateAction<boolean>>;
  deliverNotice: (title: string, body: string, kind: AppNotice["kind"], postId?: string) => void;
  flash: (message: string) => void;
};

// [1:1 거래 채팅] 거래가 성사된 글에서만 열리는 채팅방과 메시지/이미지 전송을 담당합니다.
export function useChat({ posts, offers, messages, setMessages, viewer, setSelected, setTradeOpen, setChatListOpen, deliverNotice, flash }: UseChatArgs) {
  const [chatPost, setChatPost] = useState<Post | null>(null);

  function openChat(post: Post) {
    if (!offers.some((offer) => offer.postId === post.id && offer.status === "accepted")) {
      flash("거래가 성사된 뒤에만 채팅할 수 있어요.");
      return;
    }
    if (!messages.some((message) => message.postId === post.id)) {
      setMessages((items) => [...items, { id: uid(), postId: post.id, sender: "partner", text: "거래가 성사되었어요. 시간과 장소를 여기서 맞춰볼까요?", time: "방금" }]);
    }
    setTradeOpen(false);
    setChatListOpen(false);
    setChatPost(post);
    setSelected(null);
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chatPost) return;
    const form = new FormData(event.currentTarget);
    const text = String(form.get("message")).trim();
    if (!text) return;
    setMessages((items) => [...items, { id: uid(), postId: chatPost.id, sender: "me", text, time: "방금" }]);
    event.currentTarget.reset();
    const currentPost = chatPost;
    window.setTimeout(() => {
      const reply = "확인했어요. 말씀해 주신 시간에 맞춰볼게요!";
      setMessages((items) => [...items, { id: uid(), postId: currentPost.id, sender: "partner", text: reply, time: "방금" }]);
      deliverNotice("새 1:1 채팅", `${currentPost.author}: ${reply}`, "chat", currentPost.id);
    }, 900);
  }

  // [이미지 전송]
  async function sendChatImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !chatPost) return;
    if (!file.type.startsWith("image/") || file.size > 3_000_000) { flash("3MB 이하 이미지를 선택해 주세요."); return; }
    const postId = chatPost.id;
    try {
      const imageUrl = await resolveImageSource(file, "chat", viewer);
      setMessages((items) => [...items, { id: uid(), postId, sender: "me", text: "사진을 보냈어요.", time: "방금", imageUrl }]);
      flash("거래 사진을 보냈어요.");
    } catch { flash("이미지를 전송하지 못했어요."); }
    event.target.value = "";
  }

  const activeMessages = messages.filter((message) => message.postId === chatPost?.id);
  const chatPosts = posts.filter((post) => offers.some((offer) => offer.postId === post.id && offer.status === "accepted"));
  const chatOffer = chatPost ? offers.find((offer) => offer.postId === chatPost.id && offer.status === "accepted") : null;
  const chatCounterparty = chatPost?.mine ? chatOffer?.nickname ?? "거래 상대" : chatPost?.author ?? "거래 상대";

  return {
    chatPost, setChatPost,
    activeMessages,
    chatPosts,
    chatOffer,
    chatCounterparty,
    openChat,
    sendMessage,
    sendChatImage,
  };
}
