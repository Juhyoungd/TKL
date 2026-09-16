"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { categories, regions, sortOptions } from "@/src/constants/feature-spec";
import { PostCard } from "@/src/components/market/PostCard";
import { usePostMarket } from "@/src/hooks/use-post-market";
import { useAppData } from "@/src/state/AppDataProvider";
import { useAuth } from "@/src/state/AuthProvider";
import { useToast } from "@/src/state/ToastProvider";
import type { Post, PostType } from "@/src/types/findgoo";

// [구매글] + [급구] 목록: 지역/가격/정렬 검색과 카드 그리드. /buy, /urgent 페이지에서 씁니다.
export function MarketSection({ type }: { type: PostType }) {
  const router = useRouter();
  const appData = useAppData();
  const { session } = useAuth();
  const { flash } = useToast();
  const market = usePostMarket(type);

  function openPost(post: Post) {
    router.push(`/post/${post.id}`);
  }

  function toggleSaved(post: Post) {
    if (!session) { flash("로그인하고 찜할 수 있어요."); return; }
    const saved = appData.savedPostIds.includes(post.id);
    appData.toggleSaved(post.id);
    flash(saved ? "찜에서 삭제했어요." : post.type === "urgent" ? "급구를 찜했어요. 마이에서 확인하세요." : "관심글로 저장했어요.");
  }

  return (
    <section id="market" className="market-section">
      <div className="market-heading">
        <div><span className="section-label">NEARBY</span><h2>{type === "buy" ? "이웃이 찾는 물건" : "지금 필요한 도움"}</h2></div>
        <div className="type-switch">
          <button className={type === "buy" ? "active" : ""} onClick={() => router.push("/buy")}>구매글</button>
          <button className={type === "urgent" ? "urgent active" : ""} onClick={() => router.push("/urgent")}>급구</button>
        </div>
      </div>
      <div className="market-tools clean-tools">
        <span>{market.filtered.length}개의 글</span>
        <button className={market.regionOnly ? "near-toggle on" : "near-toggle"} onClick={() => setRegionOnlyGuarded()}><span></span>내 동네만</button>
      </div>
      {/* [검색] */}
      <div className="advanced-search">
        <label><span>지역 검색</span><select value={market.searchRegion} disabled={market.regionOnly} onChange={(event) => market.setSearchRegion(event.target.value)}><option>전체 지역</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>가격 검색</span><select value={market.maxPrice} onChange={(event) => market.setMaxPrice(Number(event.target.value))}><option value={0}>가격 전체</option><option value={30000}>3만원 이하</option><option value={100000}>10만원 이하</option><option value={300000}>30만원 이하</option><option value={1000000}>100만원 이하</option></select></label>
        <label><span>정렬</span><select value={market.sortBy} onChange={(event) => market.setSortBy(event.target.value as (typeof sortOptions)[number]["value"])}>{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <button onClick={market.resetSearch}>초기화</button>
      </div>
      <div className="category-row">{categories.map((item) => <button key={item} className={market.category === item ? "active" : ""} onClick={() => market.setCategory(item)}>{item}</button>)}</div>
      <div className="post-grid">
        {market.filtered.map((post) => (
          <PostCard key={post.id} post={post} saved={appData.savedPostIds.includes(post.id)} onOpen={openPost} onToggleSaved={toggleSaved} />
        ))}
        {!market.filtered.length && (
          <div className="empty-market">
            <span>⌕</span>
            <strong>조건에 맞는 글이 없어요</strong>
            <p>검색 조건을 바꾸거나 첫 글을 올려보세요.</p>
            <Link href={session ? `/post/new?type=${type}` : `/signin?returnTo=${encodeURIComponent(`/post/new?type=${type}`)}`}>글 올리기</Link>
          </div>
        )}
      </div>
    </section>
  );

  function setRegionOnlyGuarded() {
    if (!session) { flash("로그인하고 내 동네 글만 볼 수 있어요."); return; }
    market.setRegionOnly((value) => !value);
  }
}
