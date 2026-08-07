"use client";

import type { ChangeEvent, FormEvent } from "react";
import { won } from "@/src/utils/format";
import type { ChatMessage, Offer, Post } from "@/src/types/findgoo";

type ChatModalProps = {
  chatPost: Post;
  chatCounterparty: string;
  chatOffer: Offer | null | undefined;
  activeMessages: ChatMessage[];
  onClose: () => void;
  onOpenDealPanel: () => void;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
  onSendImage: (event: ChangeEvent<HTMLInputElement>) => void;
};

// [채팅방] 거래가 성사된 상대와 나누는 1:1 채팅
export function ChatModal({ chatPost, chatCounterparty, chatOffer, activeMessages, onClose, onOpenDealPanel, onSendMessage, onSendImage }: ChatModalProps) {
  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <section className="chat-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-handle"></div>
        <header>
          <button onClick={onClose}>←</button>
          <div><strong>{chatCounterparty}</strong><small>{chatPost.title}</small></div>
          <span className="online-dot"></span>
        </header>
        <div className="deal-chat-banner">
          <span>거래 성사</span>
          <p>{won(chatOffer?.price ?? chatPost.price)} · {chatPost.region}</p>
          <button onClick={onOpenDealPanel}>거래 관리</button>
        </div>
        <div className="chat-notice">이 채팅은 거래가 성사된 두 사람에게만 열렸습니다.</div>
        {/* [메시지 전송] */}
        <div className="chat-messages">
          {activeMessages.map((message) => (
            <div key={message.id} className={`chat-bubble ${message.sender}`}>
              {message.imageUrl && <img src={message.imageUrl} alt="거래 채팅 첨부 이미지" />}
              <p>{message.text}</p>
              <small>{message.time}</small>
            </div>
          ))}
        </div>
        <form className="chat-compose" onSubmit={onSendMessage}>
          {/* [이미지 전송] */}
          <label aria-label="이미지 전송"><span>＋</span><input type="file" accept="image/*" onChange={onSendImage} /></label>
          <input name="message" autoComplete="off" placeholder="거래 시간과 장소를 정해보세요" />
          <button type="submit">↑</button>
        </form>
      </section>
    </div>
  );
}
