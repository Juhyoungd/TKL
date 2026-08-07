"use client";

import type { Dispatch, SetStateAction } from "react";
import type { FeaturePanelKey, PostType, ThemeId } from "@/src/types/findgoo";

type ThemeOption = { id: ThemeId; label: string; icon: string; colors: readonly [string, string, string] };

type HomeOverviewProps = {
  region: string;
  activeTheme: ThemeOption;
  nextTheme: ThemeOption;
  onCycleTheme: () => void;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  onCreatePost: (type: PostType) => void;
  chatCount: number;
  pendingIncomingCount: number;
  outgoingPendingCount: number;
  savedUrgentCount: number;
  onOpenChatList: () => void;
  onOpenTrade: () => void;
  onOpenSettings: () => void;
  onOpenFeaturePanel: (panel: FeaturePanelKey) => void;
};

// [홈] 검색, 빠른 글쓰기, 활동 요약, 전체 기능 바로가기를 모은 홈 화면
export function HomeOverview({ region, activeTheme, nextTheme, onCycleTheme, query, setQuery, onCreatePost, chatCount, pendingIncomingCount, outgoingPendingCount, savedUrgentCount, onOpenChatList, onOpenTrade, onOpenSettings, onOpenFeaturePanel }: HomeOverviewProps) {
  return (
    <section className="app-overview">
      <div className="welcome-row">
        <div><span>⌖ {region}</span><h1>무엇을 찾고 있나요?</h1><p>원하는 물건이나 도움이 필요한 일을 먼저 올려보세요.</p></div>
        <button className="palette-switch" aria-label={`현재 ${activeTheme.label} 색상, 다음 색상으로 변경`} onClick={onCycleTheme}>
          <span>{activeTheme.icon}</span>
          <div><strong>색상 변경</strong><small>{activeTheme.label} → {nextTheme.label}</small></div>
        </button>
      </div>
      <label className="home-search">
        <span>⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="물건, 심부름, 일손을 검색해요" />
        {query && <button onClick={() => setQuery("")}>×</button>}
      </label>
      <div className="home-actions">
        <button onClick={() => onCreatePost("buy")}><span className="action-icon buy">＋</span><div><strong>구매글 올리기</strong><small>찾는 물건을 알려주세요</small></div><b>›</b></button>
        <button onClick={() => onCreatePost("urgent")}><span className="action-icon urgent">ϟ</span><div><strong>급구 올리기</strong><small>사람과 심부름을 구해요</small></div><b>›</b></button>
      </div>
      <div className="home-status">
        <button onClick={onOpenChatList}><span>{chatCount}</span><small>최근 채팅</small></button>
        <button onClick={onOpenTrade}><span>{pendingIncomingCount}</span><small>받은 제안</small></button>
        <button onClick={onOpenTrade}><span>{outgoingPendingCount}</span><small>보낸 제안</small></button>
        <button onClick={onOpenSettings}><span>{savedUrgentCount}</span><small>찜한 급구</small></button>
      </div>
      {/* [전체 기능 관리] */}
      <div className="service-shortcuts">
        <button onClick={() => onOpenFeaturePanel("all")}><span>▦</span>전체 기능</button>
        <button onClick={() => onOpenFeaturePanel("activity")}><span>▤</span>내 활동</button>
        <button onClick={() => onOpenFeaturePanel("deal")}><span>✓</span>거래 관리</button>
        <button onClick={() => onOpenFeaturePanel("support")}><span>?</span>고객센터</button>
      </div>
    </section>
  );
}
