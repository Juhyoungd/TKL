"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/src/state/AppDataProvider";
import { useAuth } from "@/src/state/AuthProvider";
import { sortOptions } from "@/src/constants/feature-spec";
import type { PostType } from "@/src/types/findgoo";

// [구매글] + [급구] 목록 페이지(/buy, /urgent)의 검색/정렬 조건을 담당합니다.
// 글 상세/작성은 이제 /post/[id], /post/new 같은 별도 페이지입니다.
export function usePostMarket(type: PostType) {
  const appData = useAppData();
  const { profile } = useAuth();
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [searchRegion, setSearchRegion] = useState("전체 지역");
  const [maxPrice, setMaxPrice] = useState(0);
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>("latest");
  const [regionOnly, setRegionOnly] = useState(false);

  const filtered = useMemo(() => {
    const list = appData.posts.filter((post) => {
      const matchesType = post.type === type;
      const matchesCategory = category === "전체" || post.category === category;
      const needle = query.trim().toLowerCase();
      const matchesQuery = !needle || `${post.title} ${post.description} ${post.category}`.toLowerCase().includes(needle);
      const matchesRegion = (!regionOnly && searchRegion === "전체 지역") || post.region === (regionOnly ? profile?.region : searchRegion);
      const matchesPrice = maxPrice === 0 || post.price <= maxPrice;
      return matchesType && matchesCategory && matchesQuery && matchesRegion && matchesPrice;
    });
    return [...list].sort((a, b) => {
      if (sortBy === "popular") return (b.views + b.offerCount * 12) - (a.views + a.offerCount * 12);
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return 0; // posts는 이미 최신순으로 조회되어 있습니다.
    });
  }, [appData.posts, category, maxPrice, query, regionOnly, profile?.region, searchRegion, sortBy, type]);

  function resetSearch() {
    setSearchRegion("전체 지역");
    setMaxPrice(0);
    setSortBy("latest");
    setCategory("전체");
    setQuery("");
  }

  return {
    category, setCategory,
    query, setQuery,
    searchRegion, setSearchRegion,
    maxPrice, setMaxPrice,
    sortBy, setSortBy,
    regionOnly, setRegionOnly,
    filtered,
    resetSearch,
  };
}
