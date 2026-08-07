"use client";

import { useMemo, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { seedPosts, sortOptions } from "@/src/constants/feature-spec";
import { uid } from "@/src/utils/format";
import type { AppNotice, ChatMessage, Offer, Post, PostType } from "@/src/types/findgoo";

type UsePostMarketArgs = {
  posts: Post[];
  setPosts: Dispatch<SetStateAction<Post[]>>;
  setOffers: Dispatch<SetStateAction<Offer[]>>;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  keywords: string[];
  nickname: string;
  region: string;
  initialType: PostType;
  setSettingsOpen: Dispatch<SetStateAction<boolean>>;
  deliverNotice: (title: string, body: string, kind: AppNotice["kind"], postId?: string) => void;
  flash: (message: string) => void;
};

// [구매글] + [급구] 검색/정렬 조건과 글 작성·수정·삭제·상태 변경을 담당합니다.
// 목록 자체는 /buy, /urgent 페이지가 각각 담당하므로 초기 type은 진입한 페이지를 따릅니다.
export function usePostMarket({ posts, setPosts, setOffers, setMessages, keywords, nickname, region, initialType, setSettingsOpen, deliverNotice, flash }: UsePostMarketArgs) {
  const [type, setType] = useState<PostType>(initialType);
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [searchRegion, setSearchRegion] = useState("전체 지역");
  const [maxPrice, setMaxPrice] = useState(0);
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>("latest");
  const [regionOnly, setRegionOnly] = useState(false);
  const [selected, setSelected] = useState<Post | null>(null);
  const [editor, setEditor] = useState<{ open: boolean; post: Post | null; type: PostType }>({ open: false, post: null, type: "buy" });

  const filtered = useMemo(() => {
    const list = posts.filter((post) => {
      const matchesType = post.type === type;
      const matchesCategory = category === "전체" || post.category === category;
      const needle = query.trim().toLowerCase();
      const matchesQuery = !needle || `${post.title} ${post.description} ${post.category}`.toLowerCase().includes(needle);
      const matchesRegion = (!regionOnly && searchRegion === "전체 지역") || post.region === (regionOnly ? region : searchRegion);
      const matchesPrice = maxPrice === 0 || post.price <= maxPrice;
      return matchesType && matchesCategory && matchesQuery && matchesRegion && matchesPrice;
    });
    return [...list].sort((a, b) => {
      if (sortBy === "popular") return (b.views + b.offerCount * 12) - (a.views + a.offerCount * 12);
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return seedPosts.findIndex((post) => post.id === a.id) - seedPosts.findIndex((post) => post.id === b.id);
    });
  }, [category, maxPrice, posts, query, region, regionOnly, searchRegion, sortBy, type]);

  function resetSearch() {
    setSearchRegion("전체 지역");
    setMaxPrice(0);
    setSortBy("latest");
    setCategory("전체");
    setQuery("");
  }

  function openPost(postId?: string) {
    if (!postId) return;
    const post = posts.find((item) => item.id === postId);
    if (!post) return;
    setSettingsOpen(false);
    setSelected(post);
  }

  // 글 카드를 열 때 조회수를 함께 올립니다.
  function viewPost(post: Post) {
    setSelected({ ...post, views: post.views + 1 });
    setPosts((items) => items.map((item) => item.id === post.id ? { ...item, views: item.views + 1 } : item));
  }

  // [거래 상태 변경] + [급구 마감]
  function changePostStatus(post: Post, status: Post["status"]) {
    setPosts((items) => items.map((item) => item.id === post.id ? { ...item, status } : item));
    setSelected((current) => current?.id === post.id ? { ...current, status } : current);
    flash(status === "open" ? "거래 가능 상태로 변경했어요." : status === "reserved" ? "거래 진행 중으로 변경했어요." : post.type === "urgent" ? "급구를 마감했어요." : "거래를 완료했어요.");
  }

  function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = {
      type: editor.type,
      category: String(form.get("category")),
      title: String(form.get("title")),
      description: String(form.get("description")),
      price: Number(form.get("price")),
      region: String(form.get("region")),
      deadline: String(form.get("deadline") ?? "") || undefined,
    };
    if (editor.post) {
      setPosts((items) => items.map((post) => post.id === editor.post?.id ? { ...post, ...values } : post));
      setSelected(null);
      flash("글을 수정했어요.");
    } else {
      const post: Post = { id: uid(), ...values, author: nickname, manner: 36.5, views: 0, offerCount: 0, created: "방금 전", status: "open", mine: true };
      setPosts((items) => [post, ...items]);
      setType(editor.type);
      const matchedKeyword = keywords.find((keyword) => `${post.title} ${post.description}`.toLowerCase().includes(keyword.toLowerCase()));
      if (matchedKeyword) deliverNotice(`‘${matchedKeyword}’ 새 글`, post.title, "keyword", post.id);
      flash("베타 글이 등록됐어요.");
    }
    setEditor({ open: false, post: null, type: editor.type });
  }

  function removePost(post: Post) {
    if (!window.confirm("이 글을 삭제할까요?")) return;
    setPosts((items) => items.filter((item) => item.id !== post.id));
    setOffers((items) => items.filter((item) => item.postId !== post.id));
    setMessages((items) => items.filter((item) => item.postId !== post.id));
    setSelected(null);
    flash("글을 삭제했어요.");
  }

  const myPosts = posts.filter((post) => post.mine);

  return {
    type,
    category, setCategory,
    query, setQuery,
    searchRegion, setSearchRegion,
    maxPrice, setMaxPrice,
    sortBy, setSortBy,
    regionOnly, setRegionOnly,
    filtered,
    myPosts,
    selected, setSelected,
    editor, setEditor,
    resetSearch,
    openPost,
    viewPost,
    changePostStatus,
    savePost,
    removePost,
  };
}
