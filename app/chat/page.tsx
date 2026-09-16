"use client";

import Link from "next/link";
import { RequireAuth } from "@/src/components/common/RequireAuth";
import { useAppData } from "@/src/state/AppDataProvider";

// [1:1 거래 채팅 목록] 거래가 성사된 상대와의 채팅방 목록
export default function ChatListPage() {
  return (
    <RequireAuth>
      <ChatListContent />
    </RequireAuth>
  );
}

function ChatListContent() {
  const appData = useAppData();

  return (
    <div className="page">
      <h1 className="page-title">1:1 거래 채팅</h1>
      <p className="page-subtitle">거래가 성사된 상대와만 대화할 수 있어요.</p>
      <section className="page-card">
        {appData.conversations.map((conversation) => (
          <Link className="chat-thread" key={conversation.id} href={`/chat/${conversation.id}`}>
            <span>{conversation.counterpartyName[0]}</span>
            <div><strong>{conversation.counterpartyName}</strong><small>{conversation.postTitle}</small></div>
            <p>{conversation.lastMessage ?? "거래 채팅을 시작하세요."}</p>
            <b>›</b>
          </Link>
        ))}
        {!appData.conversations.length && (
          <div className="chat-list-empty">
            <span>말풍선</span>
            <strong>열린 거래 채팅이 없어요</strong>
            <p>제안이 선택되어 거래가 성사되면 이곳에 1:1 채팅방이 생깁니다.</p>
            <Link href="/offers">받은 제안 보기</Link>
          </div>
        )}
      </section>
    </div>
  );
}
