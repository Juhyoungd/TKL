"use client";

import type { Dispatch, SetStateAction } from "react";
import { categories, regions, sortOptions } from "@/src/constants/feature-spec";
import { PostCard } from "@/src/components/market/PostCard";
import type { Post, PostType } from "@/src/types/findgoo";

type SortValue = (typeof sortOptions)[number]["value"];

type MarketSectionProps = {
  type: PostType;
  onSwitchType: (type: PostType) => void;
  filtered: Post[];
  regionOnly: boolean;
  setRegionOnly: Dispatch<SetStateAction<boolean>>;
  searchRegion: string;
  setSearchRegion: Dispatch<SetStateAction<string>>;
  maxPrice: number;
  setMaxPrice: Dispatch<SetStateAction<number>>;
  sortBy: SortValue;
  setSortBy: Dispatch<SetStateAction<SortValue>>;
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  onResetSearch: () => void;
  savedPostIds: string[];
  onToggleSaved: (post: Post) => void;
  onOpenPost: (post: Post) => void;
  postOfferCount: (postId: string) => number;
  onOpenEditor: (type: PostType) => void;
};

// [구매글] + [급구] 목록: 지역/가격/정렬 검색과 카드 그리드
export function MarketSection({ type, onSwitchType, filtered, regionOnly, setRegionOnly, searchRegion, setSearchRegion, maxPrice, setMaxPrice, sortBy, setSortBy, category, setCategory, onResetSearch, savedPostIds, onToggleSaved, onOpenPost, postOfferCount, onOpenEditor }: MarketSectionProps) {
  return (
    <section id="market" className="market-section">
      <div className="market-heading">
        <div><span className="section-label">NEARBY</span><h2>{type === "buy" ? "이웃이 찾는 물건" : "지금 필요한 도움"}</h2></div>
        <div className="type-switch">
          <button className={type === "buy" ? "active" : ""} onClick={() => onSwitchType("buy")}>구매글</button>
          <button className={type === "urgent" ? "urgent active" : ""} onClick={() => onSwitchType("urgent")}>급구</button>
        </div>
      </div>
      <div className="market-tools clean-tools">
        <span>{filtered.length}개의 글</span>
        <button className={regionOnly ? "near-toggle on" : "near-toggle"} onClick={() => setRegionOnly((value) => !value)}><span></span>내 동네만</button>
      </div>
      {/* [검색] */}
      <div className="advanced-search">
        <label><span>지역 검색</span><select value={searchRegion} disabled={regionOnly} onChange={(event) => setSearchRegion(event.target.value)}><option>전체 지역</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>가격 검색</span><select value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))}><option value={0}>가격 전체</option><option value={30000}>3만원 이하</option><option value={100000}>10만원 이하</option><option value={300000}>30만원 이하</option><option value={1000000}>100만원 이하</option></select></label>
        <label><span>정렬</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortValue)}>{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <button onClick={onResetSearch}>초기화</button>
      </div>
      <div className="category-row">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="post-grid">
        {filtered.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            saved={savedPostIds.includes(post.id)}
            totalOfferCount={postOfferCount(post.id)}
            onOpen={onOpenPost}
            onToggleSaved={onToggleSaved}
          />
        ))}
        {!filtered.length && (
          <div className="empty-market">
            <span>⌕</span>
            <strong>조건에 맞는 글이 없어요</strong>
            <p>검색 조건을 바꾸거나 첫 글을 올려보세요.</p>
            <button onClick={() => onOpenEditor(type)}>글 올리기</button>
          </div>
        )}
      </div>
    </section>
  );
}
