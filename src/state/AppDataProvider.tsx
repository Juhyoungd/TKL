"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { isSupabaseConfigured, supabase } from "@/src/lib/supabase/client";
import { translateSupabaseError } from "@/src/lib/supabase/auth-errors";
import { useAuth } from "@/src/state/AuthProvider";
import { timeAgo } from "@/src/utils/format";
import type { AppNotice, Conversation, Offer, Post, PostType } from "@/src/types/findgoo";

type NewPostInput = {
  type: PostType;
  category: string;
  title: string;
  description: string;
  price: number;
  region: string;
  deadline?: string;
};

type NewOfferInput = { postId: string; nickname: string; price: number; message: string };

// [DB 행 → 화면 타입] Supabase 행을 화면이 쓰던 모양으로 바꿔주는 매퍼들.
type PostRow = {
  id: string; author_id: string; author: string; type: PostType; category: string; title: string;
  description: string; price: number; region: string; deadline: string | null; status: Post["status"];
  manner: number; views: number; offer_count: number; created_at: string;
};

function mapPostRow(row: PostRow, myUserId?: string): Post {
  return {
    id: row.id, authorId: row.author_id, type: row.type, category: row.category, title: row.title,
    description: row.description, price: row.price, region: row.region, deadline: row.deadline ?? undefined,
    author: row.author, manner: row.manner, views: row.views, offerCount: row.offer_count,
    created: timeAgo(row.created_at), status: row.status, mine: myUserId != null && row.author_id === myUserId,
  };
}

type OfferRow = {
  id: string; post_id: string; offerer_id: string; offerer_nickname: string; price: number; message: string;
  status: Offer["status"]; created_at: string;
};

function mapOfferRow(row: OfferRow, myId: string): Offer {
  return {
    id: row.id, postId: row.post_id, offererId: row.offerer_id, nickname: row.offerer_nickname, price: row.price,
    message: row.message, direction: row.offerer_id === myId ? "outgoing" : "incoming", status: row.status,
    created: timeAgo(row.created_at),
  };
}

type ConversationRow = {
  id: string; post_id: string; seller_id: string; buyer_id: string; last_message: string | null;
  last_message_at: string | null; post: { id: string; title: string; price: number; author: string } | null;
};

function mapConversationRow(row: ConversationRow, myId: string, nicknames: Map<string, string>): Conversation {
  const counterpartyId = row.seller_id === myId ? row.buyer_id : row.seller_id;
  return {
    id: row.id, postId: row.post_id, postTitle: row.post?.title ?? "삭제된 게시글", postPrice: row.post?.price ?? 0,
    sellerId: row.seller_id, buyerId: row.buyer_id, counterpartyId,
    counterpartyName: nicknames.get(counterpartyId) ?? row.post?.author ?? "거래 상대",
    lastMessage: row.last_message, lastMessageAt: row.last_message_at,
  };
}

type NoticeRow = {
  id: string; kind: AppNotice["kind"]; title: string; body: string; read: boolean;
  target_type: "post" | "offer" | "chat" | "transactions" | "region"; target_id: string | null; created_at: string;
};

function mapNoticeRow(row: NoticeRow): AppNotice {
  return {
    id: row.id, kind: row.kind, title: row.title, body: row.body, time: timeAgo(row.created_at), read: row.read,
    postId: row.target_type === "post" ? row.target_id ?? undefined : undefined,
    conversationId: row.target_type === "chat" ? row.target_id ?? undefined : undefined,
  };
}

type PublicProfileRow = { id: string; nickname: string | null };

type AppDataContextValue = {
  posts: Post[];
  getPost: (postId: string) => Promise<Post | null>;
  addPost: (input: NewPostInput, authorName: string) => Promise<{ post: Post | null; error: string | null }>;
  updatePost: (postId: string, input: NewPostInput) => Promise<{ error: string | null }>;
  updatePostStatus: (postId: string, status: Post["status"]) => Promise<{ error: string | null }>;
  removePost: (postId: string) => Promise<{ error: string | null }>;
  savedPostIds: string[];
  toggleSaved: (postId: string) => void;
  offers: Offer[];
  addOffer: (input: NewOfferInput) => Promise<{ error: string | null }>;
  updateOfferStatus: (offerId: string, status: Offer["status"]) => Promise<{ error: string | null }>;
  editOffer: (offerId: string, price: number, message: string) => Promise<{ error: string | null }>;
  acceptOfferAndOpenChat: (offer: Offer) => Promise<{ conversation: Conversation | null; error: string | null }>;
  conversations: Conversation[];
  startOrGetConversation: (post: Post) => Promise<{ conversation: Conversation | null; error: string | null }>;
  notices: AppNotice[];
  unreadNoticeCount: number;
  markNoticeRead: (noticeId: string) => void;
  markAllNoticesRead: () => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

// [실데이터] 게시글/찜/제안/대화방/알림을 Supabase와 동기화합니다. findgoo-app(모바일)의
// AppDataContext와 같은 스키마를 사용하므로 앱·웹이 같은 데이터를 봅니다.
export function AppDataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const myId = session?.user.id;

  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notices, setNotices] = useState<AppNotice[]>([]);

  const nicknameCacheRef = useRef<Map<string, string>>(new Map());

  async function resolveNicknames(ids: string[]) {
    const missing = ids.filter((id) => !nicknameCacheRef.current.has(id));
    if (missing.length > 0) {
      const { data } = await supabase.rpc("get_public_profiles", { p_ids: missing });
      for (const row of (data ?? []) as PublicProfileRow[]) {
        nicknameCacheRef.current.set(row.id, row.nickname || "찾구 회원");
      }
    }
    return nicknameCacheRef.current;
  }

  // [게시글] 전체 조회 + 새 글 실시간 반영. posts는 RLS상 비로그인 방문자도 볼 수 있어요(공개 열람).
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(200).then(({ data, error }) => {
      if (cancelled || error || !data) return;
      setPosts((data as PostRow[]).map((row) => mapPostRow(row, myId)));
    });

    const channel = supabase
      .channel("posts-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        const row = payload.new as PostRow;
        setPosts((items) => (items.some((post) => post.id === row.id) ? items : [mapPostRow(row, myId), ...items]));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts" }, (payload) => {
        const row = payload.new as PostRow;
        setPosts((items) => items.map((post) => (post.id === row.id ? mapPostRow(row, myId) : post)));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "posts" }, (payload) => {
        const oldRow = payload.old as PostRow;
        setPosts((items) => items.filter((post) => post.id !== oldRow.id));
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [session, myId]);

  // [찜한 글] 내 saved_posts 목록만 가져옵니다.
  useEffect(() => {
    if (!isSupabaseConfigured || !session) return;
    supabase.from("saved_posts").select("post_id").eq("user_id", session.user.id).then(({ data, error }) => {
      if (!error && data) setSavedPostIds(data.map((row) => row.post_id as string));
    });
  }, [session]);

  // [제안] 내가 받은/보낸 제안 전체(RLS가 걸러줌) + 실시간 반영
  useEffect(() => {
    if (!isSupabaseConfigured || !session || !myId) return;
    let cancelled = false;

    supabase.from("offers").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (cancelled || error || !data) return;
      setOffers((data as OfferRow[]).map((row) => mapOfferRow(row, myId)));
    });

    const channel = supabase
      .channel("offers-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, (payload) => {
        if (payload.eventType === "DELETE") {
          const oldRow = payload.old as OfferRow;
          setOffers((items) => items.filter((offer) => offer.id !== oldRow.id));
          return;
        }
        const mapped = mapOfferRow(payload.new as OfferRow, myId);
        setOffers((items) => (items.some((offer) => offer.id === mapped.id) ? items.map((offer) => (offer.id === mapped.id ? mapped : offer)) : [mapped, ...items]));
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [session, myId]);

  // [대화방] 내가 판매자/구매자인 대화방 + 상대 닉네임 + 실시간 반영
  const loadConversations = useCallback(async () => {
    if (!isSupabaseConfigured || !session || !myId) return;
    const { data, error } = await supabase
      .from("conversations")
      .select("*, post:posts(id, title, price, author)")
      .or(`seller_id.eq.${myId},buyer_id.eq.${myId}`)
      .order("last_message_at", { ascending: false, nullsFirst: false });
    if (error || !data) return;

    const rows = data as ConversationRow[];
    const counterpartyIds = [...new Set(rows.map((row) => (row.seller_id === myId ? row.buyer_id : row.seller_id)))];
    const nicknames = await resolveNicknames(counterpartyIds);
    setConversations(rows.map((row) => mapConversationRow(row, myId, nicknames)));
  }, [session, myId]);

  useEffect(() => {
    if (!isSupabaseConfigured || !session) return;
    loadConversations();
    const channel = supabase
      .channel("conversations-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => loadConversations())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, loadConversations]);

  // [알림함] 내 알림만 조회 + 실시간 반영
  useEffect(() => {
    if (!isSupabaseConfigured || !session || !myId) return;
    let cancelled = false;

    supabase.from("notices").select("*").eq("user_id", myId).order("created_at", { ascending: false }).limit(100).then(({ data, error }) => {
      if (cancelled || error || !data) return;
      setNotices((data as NoticeRow[]).map(mapNoticeRow));
    });

    const channel = supabase
      .channel("notices-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "notices", filter: `user_id=eq.${myId}` }, (payload) => {
        if (payload.eventType === "DELETE") {
          const oldRow = payload.old as NoticeRow;
          setNotices((items) => items.filter((notice) => notice.id !== oldRow.id));
          return;
        }
        const mapped = mapNoticeRow(payload.new as NoticeRow);
        setNotices((items) => (items.some((notice) => notice.id === mapped.id) ? items.map((notice) => (notice.id === mapped.id ? mapped : notice)) : [mapped, ...items]));
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [session, myId]);

  // [글 상세] 목록에 없을 수도 있는(직접 링크로 들어온) 글 하나를 조회합니다. 비로그인 방문자도 볼 수 있어요.
  const getPost = useCallback(async (postId: string): Promise<Post | null> => {
    const cached = posts.find((post) => post.id === postId);
    if (cached) return cached;
    const { data, error } = await supabase.from("posts").select("*").eq("id", postId).single();
    if (error || !data) return null;
    return mapPostRow(data as PostRow, myId);
  }, [posts, myId]);

  const addPost = useCallback(async (input: NewPostInput, authorName: string) => {
    if (!session) return { post: null, error: "로그인이 필요해요." };
    const { data, error } = await supabase
      .from("posts")
      .insert({ author_id: session.user.id, author: authorName, type: input.type, category: input.category, title: input.title, description: input.description, price: input.price, region: input.region, deadline: input.deadline ?? null })
      .select("*")
      .single();
    if (error || !data) return { post: null, error: translateSupabaseError(error) ?? "게시글 등록에 실패했어요." };
    const post = mapPostRow(data as PostRow, session.user.id);
    setPosts((items) => [post, ...items]);
    return { post, error: null };
  }, [session]);

  const updatePost = useCallback(async (postId: string, input: NewPostInput) => {
    const before = posts;
    setPosts((items) => items.map((post) => (post.id === postId ? { ...post, ...input } : post)));
    const { error } = await supabase
      .from("posts")
      .update({ type: input.type, category: input.category, title: input.title, description: input.description, price: input.price, region: input.region, deadline: input.deadline ?? null })
      .eq("id", postId);
    if (error) setPosts(before);
    return { error: translateSupabaseError(error) };
  }, [posts]);

  const updatePostStatus = useCallback(async (postId: string, status: Post["status"]) => {
    const before = posts;
    setPosts((items) => items.map((post) => (post.id === postId ? { ...post, status } : post)));
    const { error } = await supabase.from("posts").update({ status }).eq("id", postId);
    if (error) setPosts(before);
    return { error: translateSupabaseError(error) };
  }, [posts]);

  const removePost = useCallback(async (postId: string) => {
    const before = posts;
    setPosts((items) => items.filter((post) => post.id !== postId));
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) setPosts(before);
    return { error: translateSupabaseError(error) };
  }, [posts]);

  const toggleSaved = useCallback((postId: string) => {
    if (!session) return;
    const alreadySaved = savedPostIds.includes(postId);
    const before = savedPostIds;
    setSavedPostIds(alreadySaved ? before.filter((id) => id !== postId) : [postId, ...before]);
    const request = alreadySaved
      ? supabase.from("saved_posts").delete().eq("user_id", session.user.id).eq("post_id", postId)
      : supabase.from("saved_posts").insert({ user_id: session.user.id, post_id: postId });
    request.then(({ error }) => {
      if (error) setSavedPostIds(before);
    });
  }, [savedPostIds, session]);

  const addOffer = useCallback(async (input: NewOfferInput) => {
    if (!session) return { error: "로그인이 필요해요." };
    const { data, error } = await supabase
      .from("offers")
      .insert({ post_id: input.postId, offerer_id: session.user.id, offerer_nickname: input.nickname, price: input.price, message: input.message })
      .select("*")
      .single();
    if (error || !data) return { error: translateSupabaseError(error) ?? "제안을 보내지 못했어요." };
    setOffers((items) => [mapOfferRow(data as OfferRow, session.user.id), ...items]);
    return { error: null };
  }, [session]);

  const updateOfferStatus = useCallback(async (offerId: string, status: Offer["status"]) => {
    const before = offers;
    setOffers((items) => items.map((offer) => (offer.id === offerId ? { ...offer, status } : offer)));
    const { error } = await supabase.from("offers").update({ status }).eq("id", offerId);
    if (error) setOffers(before);
    return { error: translateSupabaseError(error) };
  }, [offers]);

  const editOffer = useCallback(async (offerId: string, price: number, message: string) => {
    const before = offers;
    setOffers((items) => items.map((offer) => (offer.id === offerId ? { ...offer, price, message } : offer)));
    const { error } = await supabase.from("offers").update({ price, message }).eq("id", offerId);
    if (error) setOffers(before);
    return { error: translateSupabaseError(error) };
  }, [offers]);

  // [제안 수락] 대화방 자동 생성까지 함께 처리하는 accept_offer RPC를 호출한 뒤,
  // 방금 열린 대화방을 찾아 바로 채팅 화면으로 이동할 수 있게 돌려줍니다.
  const acceptOfferAndOpenChat = useCallback(async (offer: Offer): Promise<{ conversation: Conversation | null; error: string | null }> => {
    if (!myId) return { conversation: null, error: "로그인이 필요해요." };
    const { error } = await supabase.rpc("accept_offer", { p_offer_id: offer.id });
    if (error) return { conversation: null, error: translateSupabaseError(error) };
    setOffers((items) => items.map((item) => (item.id === offer.id ? { ...item, status: "accepted" } : item)));

    const { data } = await supabase
      .from("conversations")
      .select("*, post:posts(id, title, price, author)")
      .eq("post_id", offer.postId)
      .eq("buyer_id", offer.offererId ?? "")
      .single();
    if (!data) {
      await loadConversations();
      return { conversation: null, error: null };
    }
    const row = data as ConversationRow;
    const nicknames = await resolveNicknames([offer.offererId ?? ""]);
    const conversation = mapConversationRow(row, myId, nicknames);
    setConversations((items) => (items.some((item) => item.id === conversation.id) ? items : [conversation, ...items]));
    return { conversation, error: null };
  }, [myId, loadConversations]);

  // [채팅 시작] 이 글에 대해 나(구매자)와 글쓴이 사이의 대화방을 찾고, 없으면 새로 만듭니다.
  const startOrGetConversation = useCallback(async (post: Post): Promise<{ conversation: Conversation | null; error: string | null }> => {
    if (!myId) return { conversation: null, error: "로그인이 필요해요." };
    if (post.mine || !post.authorId) return { conversation: null, error: "본인 글에는 채팅을 시작할 수 없어요." };

    const existing = conversations.find((item) => item.postId === post.id && item.buyerId === myId);
    if (existing) return { conversation: existing, error: null };

    const { data, error } = await supabase
      .from("conversations")
      .insert({ post_id: post.id, seller_id: post.authorId, buyer_id: myId })
      .select("*, post:posts(id, title, price, author)")
      .single();

    if (error?.code === "23505") {
      const { data: existingRow } = await supabase
        .from("conversations")
        .select("*, post:posts(id, title, price, author)")
        .eq("post_id", post.id)
        .eq("buyer_id", myId)
        .single();
      if (existingRow) {
        const nicknames = await resolveNicknames([post.authorId]);
        const conversation = mapConversationRow(existingRow as ConversationRow, myId, nicknames);
        setConversations((items) => (items.some((item) => item.id === conversation.id) ? items : [conversation, ...items]));
        return { conversation, error: null };
      }
    }
    if (error || !data) return { conversation: null, error: translateSupabaseError(error) ?? "채팅을 시작하지 못했어요." };

    const nicknames = await resolveNicknames([post.authorId]);
    const conversation = mapConversationRow(data as ConversationRow, myId, nicknames);
    setConversations((items) => [conversation, ...items]);
    return { conversation, error: null };
  }, [myId, conversations]);

  const markNoticeRead = useCallback((noticeId: string) => {
    setNotices((items) => items.map((notice) => (notice.id === noticeId ? { ...notice, read: true } : notice)));
    supabase.from("notices").update({ read: true }).eq("id", noticeId).then(() => undefined);
  }, []);

  const markAllNoticesRead = useCallback(() => {
    if (!myId) return;
    setNotices((items) => items.map((notice) => ({ ...notice, read: true })));
    supabase.from("notices").update({ read: true }).eq("user_id", myId).eq("read", false).then(() => undefined);
  }, [myId]);

  const unreadNoticeCount = useMemo(() => notices.filter((notice) => !notice.read).length, [notices]);

  const value = useMemo<AppDataContextValue>(() => ({
    posts, getPost, addPost, updatePost, updatePostStatus, removePost,
    savedPostIds, toggleSaved,
    offers, addOffer, updateOfferStatus, editOffer, acceptOfferAndOpenChat,
    conversations, startOrGetConversation,
    notices, unreadNoticeCount, markNoticeRead, markAllNoticesRead,
  }), [posts, getPost, addPost, updatePost, updatePostStatus, removePost, savedPostIds, toggleSaved, offers, addOffer, updateOfferStatus, editOffer, acceptOfferAndOpenChat, conversations, startOrGetConversation, notices, unreadNoticeCount, markNoticeRead, markAllNoticesRead]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData는 AppDataProvider 안에서만 사용할 수 있어요.");
  return context;
}
