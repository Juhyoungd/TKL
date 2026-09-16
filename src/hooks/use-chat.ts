"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { supabase } from "@/src/lib/supabase/client";
import { useAppData } from "@/src/state/AppDataProvider";
import { useAuth } from "@/src/state/AuthProvider";
import { signChatImage, uploadChatImage } from "@/src/services/image-upload";
import { timeAgo } from "@/src/utils/format";
import type { ChatMessage, Conversation } from "@/src/types/findgoo";

type MessageRow = {
  id: string; conversation_id: string; sender_id: string; text: string;
  content_type: "text" | "image"; image_path: string | null; created_at: string;
};

// [1:1 거래 채팅] 하나의 대화방(conversation) 안에서 메시지를 실시간 조회/전송합니다. /chat/[id] 페이지 전용.
export function useChatThread(conversation: Conversation | null) {
  const appData = useAppData();
  const { session } = useAuth();
  const myId = session?.user.id;
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);

  const mapMessageRow = useCallback(async (row: MessageRow): Promise<ChatMessage> => {
    let imageUrl: string | null = null;
    if (row.content_type === "image" && row.image_path) {
      const signed = await signChatImage(row.image_path);
      imageUrl = signed.url;
    }
    return { id: row.id, conversationId: row.conversation_id, senderId: row.sender_id, mine: row.sender_id === myId, text: row.text, time: timeAgo(row.created_at), imageUrl };
  }, [myId]);

  // 대화방이 바뀌면 렌더링 중에 바로 메시지를 비우고, 아래 effect가 비동기로 새로 채웁니다.
  const conversationKey = conversation?.id ?? null;
  const [loadedConversationKey, setLoadedConversationKey] = useState<string | null>(null);
  if (conversationKey !== loadedConversationKey) {
    setLoadedConversationKey(conversationKey);
    setActiveMessages([]);
  }

  useEffect(() => {
    if (!conversation || !myId) return;
    let cancelled = false;

    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(200)
      .then(async ({ data, error }) => {
        if (cancelled || error || !data) return;
        const mapped = await Promise.all((data as MessageRow[]).map(mapMessageRow));
        if (!cancelled) setActiveMessages(mapped);
      });

    supabase.rpc("mark_conversation_read", { p_conversation_id: conversation.id });

    const channel = supabase
      .channel(`messages-${conversation.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversation.id}` }, (payload) => {
        const row = payload.new as MessageRow;
        mapMessageRow(row).then((mapped) => {
          setActiveMessages((items) => (items.some((message) => message.id === mapped.id) ? items : [...items, mapped]));
        });
        if (row.sender_id !== myId) supabase.rpc("mark_conversation_read", { p_conversation_id: conversation.id });
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [conversation, myId, mapMessageRow]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!conversation || !myId) return;
    const form = new FormData(event.currentTarget);
    const text = String(form.get("message")).trim();
    if (!text) return;
    event.currentTarget.reset();
    await supabase.from("messages").insert({ conversation_id: conversation.id, sender_id: myId, text });
  }

  // [이미지 전송]
  async function sendChatImage(event: ChangeEvent<HTMLInputElement>, flash: (message: string) => void) {
    const file = event.target.files?.[0];
    if (!file || !conversation || !myId) return;
    if (!file.type.startsWith("image/") || file.size > 3_000_000) { flash("3MB 이하 이미지를 선택해 주세요."); event.target.value = ""; return; }
    const { path, error } = await uploadChatImage(file, conversation.id, myId);
    if (error || !path) { flash("이미지를 전송하지 못했어요."); event.target.value = ""; return; }
    const { error: insertError } = await supabase
      .from("messages")
      .insert({ conversation_id: conversation.id, sender_id: myId, text: "사진을 보냈어요.", content_type: "image", image_path: path });
    if (insertError) flash("이미지를 전송하지 못했어요.");
    event.target.value = "";
  }

  const chatOffer = conversation
    ? appData.offers.find((offer) => offer.postId === conversation.postId && offer.offererId === conversation.buyerId && offer.status === "accepted")
    : null;

  return { activeMessages, chatOffer, sendMessage, sendChatImage };
}
