"use client";

import type { FeaturePanelKey } from "@/src/types/findgoo";

type MyMenuGridProps = {
  buyPostCount: number;
  urgentPostCount: number;
  onOpenPanel: (panel: FeaturePanelKey) => void;
};

export function MyMenuGrid({ buyPostCount, urgentPostCount, onOpenPanel }: MyMenuGridProps) {
  return (
    <section className="my-menu-grid">
      <button onClick={() => onOpenPanel("account")}><span>♙</span><strong>내 정보</strong><small>회원·지역·관심 설정</small></button>
      <button onClick={() => onOpenPanel("activity")}><span>▤</span><strong>내가 작성한 글</strong><small>구매글 {buyPostCount} · 급구 {urgentPostCount}</small></button>
      <button onClick={() => onOpenPanel("deal")}><span>✓</span><strong>거래 내역</strong><small>진행·완료·취소</small></button>
      <button onClick={() => onOpenPanel("trust")}><span>36.5</span><strong>신뢰도</strong><small>평점과 받은 후기</small></button>
      <button onClick={() => onOpenPanel("support")}><span>?</span><strong>고객센터</strong><small>FAQ · 1:1 문의</small></button>
      <button onClick={() => onOpenPanel("all")}><span>▦</span><strong>전체 기능</strong><small>기능명세 전체 보기</small></button>
    </section>
  );
}
