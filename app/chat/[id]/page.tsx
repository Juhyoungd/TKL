"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RequireAuth } from "@/src/components/common/RequireAuth";
import { useChatThread } from "@/src/hooks/use-chat";
import { useAppData } from "@/src/state/AppDataProvider";
import { useToast } from "@/src/state/ToastProvider";
import { won } from "@/src/utils/format";

// [채팅방] 거래가 성사된 상대와 나누는 1:1 채팅
export default function ChatThreadPage() {
  return (
    <RequireAuth>
      <ChatThreadContent />
    </RequireAuth>
  );
}

function ChatThreadContent() {
  const { id } = useParams<{ id: string }>();
  const appData = useAppData();
  const { flash } = useToast();
  const conversation = appData.conversations.find((item) => item.id === id) ?? null;
  const { activeMessages, chatOffer, sendMessage, sendChatImage } = useChatThread(conversation);

  if (!conversation) {
    return (
      <div className="page">
        <Link className="page-back" href="/chat">← 채팅 목록</Link>
        <p>대화방을 불러오는 중이거나 존재하지 않아요.</p>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-page-header">
        <Link className="page-back" href="/chat" style={{ marginBottom: 0 }}>←</Link>
        <div><strong>{conversation.counterpartyName}</strong><small>{conversation.postTitle}</small></div>
      </div>
      <div className="deal-chat-banner">
        <span>거래 성사</span>
        <p>{won(chatOffer?.price ?? conversation.postPrice)}</p>
      </div>
      <div className="chat-notice">이 채팅은 거래가 성사된 두 사람에게만 열렸습니다.</div>
      <div className="chat-messages">
        {activeMessages.map((message) => (
          <div key={message.id} className={`chat-bubble ${message.mine ? "me" : "partner"}`}>
            {message.imageUrl && <img src={message.imageUrl} alt="거래 채팅 첨부 이미지" />}
            <p>{message.text}</p>
            <small>{message.time}</small>
          </div>
        ))}
      </div>
      <form className="chat-compose" onSubmit={sendMessage}>
        <label aria-label="이미지 전송"><span>＋</span><input type="file" accept="image/*" onChange={(event) => sendChatImage(event, flash)} /></label>
        <input name="message" autoComplete="off" placeholder="거래 시간과 장소를 정해보세요" />
        <button type="submit">↑</button>
      </form>
    </div>
  );
}
