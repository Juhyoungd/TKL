"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { createSupportTicket, uploadFindgooImage } from "@/src/api/findgoo-client";
import { appIcons } from "@/src/assets/app-icons";
import { FeaturePanel } from "@/src/components/feature/FeaturePanel";
import { categories, regions, seedMessages, seedNotices, seedOffers, seedPosts, sortOptions } from "@/src/constants/feature-spec";
import { useInitialAppView } from "@/src/hooks/use-initial-app-view";
import { useInstallPrompt } from "@/src/hooks/use-install-prompt";
import { readDeviceState, storageKeys, writeDeviceState } from "@/src/services/device-storage";
import { appDefaults, initialNavForView } from "@/src/store/app-store";
import { themeOptions } from "@/src/theme/palettes";
import type { AppNotice, BottomNavKey, ChatMessage, FeaturePanelKey, InitialView, Offer, Post, PostType, ThemeId, Viewer } from "@/src/types/findgoo";
import { uid, won } from "@/src/utils/format";

export function FindgooApp({ initialUser = null, initialView = "home" }: { initialUser?: Viewer; initialView?: InitialView }) {
  const [posts, setPosts] = useState<Post[]>(seedPosts);
  const [offers, setOffers] = useState<Offer[]>(seedOffers);
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [notices, setNotices] = useState<AppNotice[]>(seedNotices);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([...appDefaults.savedPostIds]);
  const [activityRegions, setActivityRegions] = useState<string[]>([...appDefaults.activityRegions]);
  const [interestCategories, setInterestCategories] = useState<string[]>([...appDefaults.interestCategories]);
  const [keywords, setKeywords] = useState<string[]>([...appDefaults.keywords]);
  const [profileImage, setProfileImage] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [type, setType] = useState<PostType>("buy");
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [searchRegion, setSearchRegion] = useState("전체 지역");
  const [maxPrice, setMaxPrice] = useState(0);
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>("latest");
  const [regionOnly, setRegionOnly] = useState(false);
  const [region, setRegion] = useState<string>(appDefaults.region);
  const [nickname, setNickname] = useState<string>(appDefaults.nickname);
  const [viewer, setViewer] = useState<Viewer>(initialUser);
  const [featurePanel, setFeaturePanel] = useState<FeaturePanelKey | null>(null);
  const [selected, setSelected] = useState<Post | null>(null);
  const [editor, setEditor] = useState<{ open: boolean; post: Post | null; type: PostType }>({ open: false, post: null, type: "buy" });
  const [chatPost, setChatPost] = useState<Post | null>(null);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [chatListOpen, setChatListOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [theme, setTheme] = useState<ThemeId>("dusk");
  const [activeNav, setActiveNav] = useState<BottomNavKey>(() => initialNavForView(initialView));
  const { installPrompt, installApp } = useInstallPrompt();

  useInitialAppView(initialView, ready, {
    setType,
    openChat: () => setChatListOpen(true),
    openProfile: () => setSettingsOpen(true),
  });

  useEffect(() => {
    setPosts(readDeviceState(storageKeys.posts, seedPosts));
    setOffers(readDeviceState(storageKeys.offers, seedOffers));
    setMessages(readDeviceState(storageKeys.chats, seedMessages));
    setNotices(readDeviceState(storageKeys.notices, seedNotices));
    setSavedPostIds(readDeviceState(storageKeys.saved, [...appDefaults.savedPostIds]));
    setActivityRegions(readDeviceState(storageKeys.regions, [...appDefaults.activityRegions]));
    setInterestCategories(readDeviceState(storageKeys.categories, [...appDefaults.interestCategories]));
    setKeywords(readDeviceState(storageKeys.keywords, [...appDefaults.keywords]));
    setProfileImage(readDeviceState(storageKeys.profileImage, ""));
    setPushEnabled(readDeviceState(storageKeys.push, false) && "Notification" in window && Notification.permission === "granted");
    setRegion(readDeviceState(storageKeys.region, appDefaults.region));
    setNickname(initialUser?.displayName ?? readDeviceState(storageKeys.nickname, appDefaults.nickname));
    const storedTheme = readDeviceState<ThemeId>(storageKeys.theme, "dusk");
    setTheme(themeOptions.some((option) => option.id === storedTheme) ? storedTheme : "dusk");
    setReady(true);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.posts, posts); }, [posts, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.offers, offers); }, [offers, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.chats, messages); }, [messages, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.notices, notices); }, [notices, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.saved, savedPostIds); }, [ready, savedPostIds]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.regions, activityRegions); }, [activityRegions, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.categories, interestCategories); }, [interestCategories, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.keywords, keywords); }, [keywords, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.profileImage, profileImage); }, [profileImage, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.push, pushEnabled); }, [pushEnabled, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.region, region); }, [ready, region]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.nickname, nickname); }, [nickname, ready]);
  useEffect(() => { if (ready) writeDeviceState(storageKeys.theme, theme); }, [ready, theme]);

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

  function flash(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2500); }
  function showMarket(nextType: PostType) { setType(nextType); document.getElementById("market")?.scrollIntoView({ behavior: "smooth" }); }
  function postOffers(postId: string) { return offers.filter((offer) => offer.postId === postId); }
  function openPost(postId?: string) {
    if (!postId) return;
    const post = posts.find((item) => item.id === postId);
    if (!post) return;
    setSettingsOpen(false);
    setSelected(post);
  }

  function deliverNotice(title: string, body: string, kind: AppNotice["kind"], postId?: string, forcePush = false) {
    setNotices((items) => [{ id: uid(), title, body, kind, postId, time: "방금", read: false }, ...items]);
    if ((!pushEnabled && !forcePush) || !("Notification" in window) || Notification.permission !== "granted") return;
    const options = { body, icon: "/og.png", badge: "/og.png", tag: `${kind}-${postId ?? "findgoo"}` };
    if ("serviceWorker" in navigator) navigator.serviceWorker.ready.then((registration) => registration.showNotification(title, options)).catch(() => new Notification(title, options));
    else new Notification(title, options);
  }

  async function requestPushNotifications() {
    if (!("Notification" in window)) { flash("이 기기에서는 알림을 지원하지 않아요."); return; }
    const permission = await Notification.requestPermission();
    const enabled = permission === "granted";
    setPushEnabled(enabled);
    if (enabled) {
      deliverNotice("찾구 알림을 시작했어요", "거래 제안, 수락, 채팅, 관심 키워드 소식을 알려드릴게요.", "system", undefined, true);
      flash("앱 알림을 켰어요.");
    } else flash("기기 설정에서 알림을 허용해 주세요.");
  }

  function toggleSaved(post: Post) {
    const saved = savedPostIds.includes(post.id);
    setSavedPostIds((items) => saved ? items.filter((id) => id !== post.id) : [post.id, ...items]);
    flash(saved ? "찜에서 삭제했어요." : post.type === "urgent" ? "급구를 찜했어요. 마이에서 확인하세요." : "관심글로 저장했어요.");
  }

  function toggleChoice(value: string, values: string[], update: (items: string[]) => void, limit = 5) {
    if (values.includes(value)) update(values.filter((item) => item !== value));
    else if (values.length < limit) update([...values, value]);
    else flash(`최대 ${limit}개까지 선택할 수 있어요.`);
  }

  function addKeyword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const keyword = String(form.get("keyword")).trim().replace(/^#/, "");
    if (keyword.length < 2) { flash("두 글자 이상 입력해 주세요."); return; }
    if (keywords.some((item) => item.toLowerCase() === keyword.toLowerCase())) { flash("이미 등록한 키워드예요."); return; }
    if (keywords.length >= 8) { flash("키워드는 최대 8개까지 등록할 수 있어요."); return; }
    setKeywords((items) => [keyword, ...items]);
    event.currentTarget.reset();
    flash(`‘${keyword}’ 알림을 등록했어요.`);
  }

  async function uploadImage(file: File, purpose: "profile" | "chat") {
    if (viewer && viewer.userId !== "guest-device") {
      return uploadFindgooImage(file, purpose);
    }
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function changeProfileImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1_500_000) { flash("1.5MB 이하 이미지 파일을 선택해 주세요."); return; }
    try { setProfileImage(await uploadImage(file, "profile")); }
    catch { flash("프로필 사진을 저장하지 못했어요."); }
  }

  // [거래 상태 변경] + [급구 마감]
  function changePostStatus(post: Post, status: Post["status"]) {
    setPosts((items) => items.map((item) => item.id === post.id ? { ...item, status } : item));
    setSelected((current) => current?.id === post.id ? { ...current, status } : current);
    flash(status === "open" ? "거래 가능 상태로 변경했어요." : status === "reserved" ? "거래 진행 중으로 변경했어요." : post.type === "urgent" ? "급구를 마감했어요." : "거래를 완료했어요.");
  }

  // [제안 수정]
  function editOffer(offer: Offer) {
    const nextPrice = Number(window.prompt("수정할 제안 가격을 입력하세요.", String(offer.price)));
    if (!Number.isFinite(nextPrice) || nextPrice < 1000) return;
    const nextMessage = window.prompt("수정할 제안 메시지를 입력하세요.", offer.message)?.trim();
    if (!nextMessage) return;
    setOffers((items) => items.map((item) => item.id === offer.id ? { ...item, price: nextPrice, message: nextMessage } : item));
    flash("제안을 수정했어요.");
  }

  // [제안 거절]
  function rejectOffer(offerId: string) {
    setOffers((items) => items.map((item) => item.id === offerId ? { ...item, status: "rejected" } : item));
    flash("제안을 거절했어요.");
  }

  // [이미지 전송]
  async function sendChatImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !chatPost) return;
    if (!file.type.startsWith("image/") || file.size > 3_000_000) { flash("3MB 이하 이미지를 선택해 주세요."); return; }
    const postId = chatPost.id;
    try {
      const imageUrl = await uploadImage(file, "chat");
      setMessages((items) => [...items, { id: uid(), postId, sender: "me", text: "사진을 보냈어요.", time: "방금", imageUrl }]);
      flash("거래 사진을 보냈어요.");
    } catch { flash("이미지를 전송하지 못했어요."); }
    event.target.value = "";
  }

  // [거래 완료] + [거래 취소] + [후기 작성] + [신고] + [차단]
  function runDealAction(actionId: string) {
    const post = chatPost ?? selected;
    if (!post) { flash("먼저 거래 글이나 채팅을 선택해 주세요."); return; }
    if (actionId === "deal-complete") { changePostStatus(post, "closed"); deliverNotice("거래가 완료됐어요", "상대방에게 후기를 남겨보세요.", "trade", post.id); return; }
    if (actionId === "deal-cancel") { if (window.confirm("이 거래를 취소할까요?")) { changePostStatus(post, "open"); flash("거래를 취소하고 글을 다시 열었어요."); } return; }
    if (actionId === "review-create") { const review = window.prompt("거래 후기를 입력해 주세요."); if (review?.trim()) flash("후기를 등록했어요. 신뢰도에 반영됩니다."); return; }
    if (actionId === "report") { const reason = window.prompt("신고 사유를 입력해 주세요."); if (reason?.trim()) flash("신고를 접수했어요. 고객센터에서 확인합니다."); return; }
    if (actionId === "block" && window.confirm(`${post.author}님을 차단할까요?`)) flash("사용자를 차단했어요.");
  }

  // [전체 기능 관리] 각 기능 버튼의 연결 지점
  function handleFeatureAction(actionId: string, actionLabel: string) {
    setFeaturePanel(null);
    if (actionId === "guest-login") { const guest = { userId: "guest-device", displayName: nickname, email: "비회원 체험" }; setViewer(guest); flash("비회원으로 시작했어요."); return; }
    if (actionId === "naver-login" || actionId === "google-login") { flash(`${actionLabel}은 OAuth 키 연결 후 활성화됩니다.`); return; }
    if (["purchase-create", "urgent-create"].includes(actionId)) { setEditor({ open: true, post: null, type: actionId.startsWith("urgent") ? "urgent" : "buy" }); return; }
    if (["purchase-view", "purchase-search", "search-keyword", "search-category", "search-region", "search-price", "sort-latest", "sort-popular"].includes(actionId)) { showMarket("buy"); return; }
    if (["urgent-view", "urgent-apply"].includes(actionId)) { showMarket("urgent"); return; }
    if (["offer-receive", "offer-create", "offer-edit", "offer-cancel", "offer-accept", "offer-reject", "my-offers"].includes(actionId)) { setTradeOpen(true); return; }
    if (["chat-create", "chat-send", "chat-image", "my-chats"].includes(actionId)) { setChatListOpen(true); return; }
    if (["deal-complete", "deal-cancel", "review-create", "report", "block"].includes(actionId)) { runDealAction(actionId); return; }
    if (actionId === "trust-view" || actionId === "my-trust") { setFeaturePanel("trust"); return; }
    if (["favorite-list", "favorite-purchase", "favorite-urgent", "my-favorites"].includes(actionId)) { setSettingsOpen(true); window.setTimeout(() => document.getElementById("saved-all")?.scrollIntoView({ behavior: "smooth" }), 120); return; }
    if (["region-setting", "category-setting", "account-edit", "my-profile", "my-notices"].includes(actionId)) { setSettingsOpen(true); return; }
    if (actionId === "terms") { setTermsOpen(true); return; }
    if (["faq", "inquiry-list", "my-support"].includes(actionId)) { setFeaturePanel("support"); return; }
    if (actionId === "inquiry-create") { setSupportOpen(true); return; }
    if (actionId === "logout" || actionId === "my-logout") { setViewer(null); flash("비회원 체험 프로필에서 로그아웃했어요."); return; }
    if (actionId === "withdraw" || actionId === "my-withdraw") { if (window.confirm("정말 회원 탈퇴를 요청할까요?")) flash("탈퇴 요청 화면을 확인했어요. 정식 계정에서는 본인인증 후 처리됩니다."); return; }
    if (actionId.startsWith("admin-")) { flash(`${actionLabel} 운영 화면을 열었어요.`); setFeaturePanel("admin"); return; }
    flash(`${actionLabel} 기능 흐름을 확인했어요.`);
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

  function submitOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    if (offers.some((offer) => offer.postId === selected.id && offer.direction === "outgoing" && offer.status === "pending")) {
      flash("이미 보낸 제안이 있어요.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const offer: Offer = { id: uid(), postId: selected.id, nickname: String(form.get("nickname")), price: Number(form.get("price")), message: String(form.get("message")), direction: "outgoing", status: "pending" };
    setOffers((items) => [offer, ...items]);
    setNickname(offer.nickname);
    setSelected(null);
    setTradeOpen(true);
    flash("제안을 보냈어요. 상대가 선택하면 1:1 채팅이 열립니다.");
  }

  function openChat(post: Post) {
    if (!offers.some((offer) => offer.postId === post.id && offer.status === "accepted")) {
      flash("거래가 성사된 뒤에만 채팅할 수 있어요.");
      return;
    }
    if (!messages.some((message) => message.postId === post.id)) {
      setMessages((items) => [...items, { id: uid(), postId: post.id, sender: "partner", text: "거래가 성사되었어요. 시간과 장소를 여기서 맞춰볼까요?", time: "방금" }]);
    }
    setTradeOpen(false);
    setChatListOpen(false);
    setChatPost(post);
    setSelected(null);
  }

  function acceptOffer(offer: Offer) {
    const post = posts.find((item) => item.id === offer.postId);
    if (!post) return;
    setOffers((items) => items.map((item) => item.id === offer.id ? { ...item, status: "accepted" } : item));
    setMessages((items) => items.some((item) => item.postId === post.id) ? items : [
      ...items,
      { id: uid(), postId: post.id, sender: "partner", text: `${won(offer.price)} 제안을 선택해 주셔서 감사합니다. 거래 시간과 장소를 정해볼까요?`, time: "방금" },
    ]);
    setTradeOpen(false);
    setChatPost(post);
    setSelected(null);
    deliverNotice("거래 요청을 수락했어요", `${offer.nickname}님과 1:1 거래 채팅이 열렸습니다.`, "trade", post.id);
    flash("거래가 성사되어 1:1 채팅방을 열었어요.");
  }

  function cancelOffer(offerId: string) {
    setOffers((items) => items.map((item) => item.id === offerId ? { ...item, status: "canceled" } : item));
    flash("제안을 취소했어요.");
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chatPost) return;
    const form = new FormData(event.currentTarget);
    const text = String(form.get("message")).trim();
    if (!text) return;
    setMessages((items) => [...items, { id: uid(), postId: chatPost.id, sender: "me", text, time: "방금" }]);
    event.currentTarget.reset();
    const currentPost = chatPost;
    window.setTimeout(() => {
      const reply = "확인했어요. 말씀해 주신 시간에 맞춰볼게요!";
      setMessages((items) => [...items, { id: uid(), postId: currentPost.id, sender: "partner", text: reply, time: "방금" }]);
      deliverNotice("새 1:1 채팅", `${currentPost.author}: ${reply}`, "chat", currentPost.id);
    }, 900);
  }

  // [1:1 문의]
  async function submitSupport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = { subject: String(form.get("subject")), body: String(form.get("body")) };
    if (viewer && viewer.userId !== "guest-device") {
      try {
        await createSupportTicket(payload);
      } catch { flash("문의 저장 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요."); return; }
    }
    setSupportOpen(false);
    flash(viewer?.userId === "guest-device" || !viewer ? "비회원 문의 예시를 접수했어요." : "1:1 문의를 접수했어요.");
  }

  function saveSettings() {
    setSettingsOpen(false);
    flash("마이페이지 설정을 저장했어요.");
  }

  const activeMessages = messages.filter((message) => message.postId === chatPost?.id);
  const incomingOffers = offers.filter((offer) => offer.direction === "incoming" && offer.status !== "canceled" && offer.status !== "rejected");
  const outgoingOffers = offers.filter((offer) => offer.direction === "outgoing" && offer.status !== "canceled");
  const chatPosts = posts.filter((post) => offers.some((offer) => offer.postId === post.id && offer.status === "accepted"));
  const chatOffer = chatPost ? offers.find((offer) => offer.postId === chatPost.id && offer.status === "accepted") : null;
  const chatCounterparty = chatPost?.mine ? chatOffer?.nickname ?? "거래 상대" : chatPost?.author ?? "거래 상대";
  const savedPosts = posts.filter((post) => savedPostIds.includes(post.id));
  const savedUrgentPosts = posts.filter((post) => post.type === "urgent" && savedPostIds.includes(post.id));
  const myPosts = posts.filter((post) => post.mine);
  const unreadCount = notices.filter((notice) => !notice.read).length;
  const pendingIncomingCount = incomingOffers.filter((offer) => offer.status === "pending").length;
  const activeTheme = themeOptions.find((option) => option.id === theme) ?? themeOptions[0];
  const nextTheme = themeOptions[(themeOptions.findIndex((option) => option.id === theme) + 1) % themeOptions.length];

  // [앱 색상]
  function cycleTheme() { setTheme(nextTheme.id); }

  return (
    <main className={`findgoo theme-${theme}`} id="top">
      {/* [홈] */}
      <header className="site-header clean-header">
        <a className="findgoo-brand" href="#top"><span className="logo-stamp">찾</span><strong>찾구</strong><small className="beta-pill">BETA</small></a>
        <nav className="desktop-nav"><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>홈</button><button onClick={() => showMarket("buy")}>구매</button><button onClick={() => showMarket("urgent")}>급구</button><button onClick={() => setChatListOpen(true)}>채팅</button><button onClick={() => setSettingsOpen(true)}>마이</button></nav>
        <div className="account-actions">{installPrompt && <button className="install-button" onClick={installApp}>앱 설치</button>}<button className="profile-button" onClick={() => setSettingsOpen(true)} aria-label="마이페이지 열기">{profileImage ? <img src={profileImage} alt="내 프로필" /> : <span>{nickname[0]}</span>}<em>마이</em>{(pendingIncomingCount + unreadCount) > 0 && <b>{pendingIncomingCount + unreadCount}</b>}</button></div>
      </header>

      <section className="app-overview">
        <div className="welcome-row"><div><span>⌖ {region}</span><h1>무엇을 찾고 있나요?</h1><p>원하는 물건이나 도움이 필요한 일을 먼저 올려보세요.</p></div><button className="palette-switch" aria-label={`현재 ${activeTheme.label} 색상, 다음 색상으로 변경`} onClick={cycleTheme}><span>{activeTheme.icon}</span><div><strong>색상 변경</strong><small>{activeTheme.label} → {nextTheme.label}</small></div></button></div>
        <label className="home-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="물건, 심부름, 일손을 검색해요" />{query && <button onClick={() => setQuery("")}>×</button>}</label>
        <div className="home-actions"><button onClick={() => setEditor({ open: true, post: null, type: "buy" })}><span className="action-icon buy">＋</span><div><strong>구매글 올리기</strong><small>찾는 물건을 알려주세요</small></div><b>›</b></button><button onClick={() => setEditor({ open: true, post: null, type: "urgent" })}><span className="action-icon urgent">ϟ</span><div><strong>급구 올리기</strong><small>사람과 심부름을 구해요</small></div><b>›</b></button></div>
        <div className="home-status"><button onClick={() => setChatListOpen(true)}><span>{chatPosts.length}</span><small>최근 채팅</small></button><button onClick={() => setTradeOpen(true)}><span>{pendingIncomingCount}</span><small>받은 제안</small></button><button onClick={() => setTradeOpen(true)}><span>{outgoingOffers.filter((item) => item.status === "pending").length}</span><small>보낸 제안</small></button><button onClick={() => setSettingsOpen(true)}><span>{savedUrgentPosts.length}</span><small>찜한 급구</small></button></div>
        {/* [전체 기능 관리] */}
        <div className="service-shortcuts"><button onClick={() => setFeaturePanel("all")}><span>▦</span>전체 기능</button><button onClick={() => setFeaturePanel("activity")}><span>▤</span>내 활동</button><button onClick={() => setFeaturePanel("deal")}><span>✓</span>거래 관리</button><button onClick={() => setFeaturePanel("support")}><span>?</span>고객센터</button></div>
      </section>

      {/* [구매글] + [급구] */}
      <section id="market" className="market-section">
        <div className="market-heading"><div><span className="section-label">NEARBY</span><h2>{type === "buy" ? "이웃이 찾는 물건" : "지금 필요한 도움"}</h2></div><div className="type-switch"><button className={type === "buy" ? "active" : ""} onClick={() => setType("buy")}>구매글</button><button className={type === "urgent" ? "urgent active" : ""} onClick={() => setType("urgent")}>급구</button></div></div>
        <div className="market-tools clean-tools"><span>{filtered.length}개의 글</span><button className={regionOnly ? "near-toggle on" : "near-toggle"} onClick={() => setRegionOnly((value) => !value)}><span></span>내 동네만</button></div>
        {/* [검색] */}
        <div className="advanced-search"><label><span>지역 검색</span><select value={searchRegion} disabled={regionOnly} onChange={(event) => setSearchRegion(event.target.value)}><option>전체 지역</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>가격 검색</span><select value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))}><option value={0}>가격 전체</option><option value={30000}>3만원 이하</option><option value={100000}>10만원 이하</option><option value={300000}>30만원 이하</option><option value={1000000}>100만원 이하</option></select></label><label><span>정렬</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><button onClick={() => { setSearchRegion("전체 지역"); setMaxPrice(0); setSortBy("latest"); setCategory("전체"); setQuery(""); }}>초기화</button></div>
        <div className="category-row">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="post-grid">{filtered.map((post) => <article className={`post-card ${post.type} status-${post.status}`} key={post.id} onClick={() => { setSelected({ ...post, views: post.views + 1 }); setPosts((items) => items.map((item) => item.id === post.id ? { ...item, views: item.views + 1 } : item)); }}><div className="post-head"><div><span className={`post-type ${post.type}`}>{post.type === "buy" ? "구매해요" : "급구"}</span><span className="post-category">{post.category}</span><span className={`post-status ${post.status}`}>{post.status === "open" ? "거래 가능" : post.status === "reserved" ? "진행 중" : "마감"}</span></div><button className={savedPostIds.includes(post.id) ? "saved" : ""} aria-label={savedPostIds.includes(post.id) ? "찜 취소" : "찜하기"} onClick={(event) => { event.stopPropagation(); toggleSaved(post); }}>{savedPostIds.includes(post.id) ? "♥" : "♡"}</button></div><h3>{post.title}</h3><p>{post.description}</p><div className="post-info"><span>⌖ {post.region}</span><span>·</span><span>{post.created}</span>{post.deadline && <span className="deadline">{post.deadline}</span>}</div><div className="post-bottom"><div><small>{post.type === "buy" ? "희망 가격" : "지원 금액"}</small><strong>{won(post.price)}</strong></div><div className="offer-bubble"><b>{post.offerCount + postOffers(post.id).length}</b><span>{post.type === "buy" ? "개의 제안" : "명 지원"}</span><i>→</i></div></div></article>)}{!filtered.length && <div className="empty-market"><span>⌕</span><strong>조건에 맞는 글이 없어요</strong><p>검색 조건을 바꾸거나 첫 글을 올려보세요.</p><button onClick={() => setEditor({ open: true, post: null, type })}>글 올리기</button></div>}</div>
      </section>

      <footer className="site-footer"><div className="footer-main"><div className="findgoo-brand light"><span className="logo-stamp">찾</span><strong>찾구</strong></div><p>찾는 사람이 먼저 올리는 리버스 로컬 마켓 · 공개 베타</p></div><div className="footer-links"><button onClick={() => setTermsOpen(true)}>이용 안내</button><button onClick={() => setSupportOpen(true)}>의견 보내기</button><span>© 2026 FINDGOO</span></div></footer>
      {/* [하단 메뉴] */}
      <nav className="mobile-nav" aria-label="주요 메뉴"><button className={activeNav === "home" ? "active" : ""} aria-current={activeNav === "home" ? "page" : undefined} onClick={() => { setActiveNav("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}><span>{appIcons.home}</span>홈</button><button className={activeNav === "urgent" ? "active" : ""} aria-current={activeNav === "urgent" ? "page" : undefined} onClick={() => { setActiveNav("urgent"); showMarket("urgent"); }}><span>{appIcons.urgent}</span>급구</button><button className={`write ${activeNav === "create" ? "active" : ""}`} aria-current={activeNav === "create" ? "page" : undefined} onClick={() => { setActiveNav("create"); setEditor({ open: true, post: null, type }); }}><span>{appIcons.create}</span>등록</button><button className={activeNav === "chat" ? "active" : ""} aria-current={activeNav === "chat" ? "page" : undefined} onClick={() => { setActiveNav("chat"); setChatListOpen(true); }}><span>{appIcons.chat}</span>채팅{chatPosts.length > 0 && <b className="nav-badge">{chatPosts.length}</b>}</button><button className={activeNav === "my" ? "active" : ""} aria-current={activeNav === "my" ? "page" : undefined} onClick={() => { setActiveNav("my"); setSettingsOpen(true); }}><span>{appIcons.profile}</span>마이{(pendingIncomingCount + unreadCount) > 0 && <b className="nav-badge">{pendingIncomingCount + unreadCount}</b>}</button></nav>

      {/* [구매글 조회] + [급구 조회] */}
      {selected && <div className="modal-layer" onMouseDown={() => setSelected(null)}>
        <section className="detail-modal" onMouseDown={(event) => event.stopPropagation()}>
          <div className="modal-handle"></div>
          <header><button onClick={() => setSelected(null)}>←</button><strong>글 상세</strong><button onClick={() => navigator.clipboard?.writeText(location.href).then(() => flash("링크를 복사했어요."))}>↗</button></header>
          <div className="detail-scroll">
            <div className="detail-tags"><span className={`post-type ${selected.type}`}>{selected.type === "buy" ? "구매해요" : "급구"}</span><span className="post-category">{selected.category}</span><span className={`post-status ${selected.status}`}>{selected.status === "open" ? "거래 가능" : selected.status === "reserved" ? "진행 중" : "마감"}</span>{selected.deadline && <b>{selected.deadline}</b>}</div>
            <h2>{selected.title}</h2>
            <div className="author-row"><span>{selected.author[0]}</span><div><strong>{selected.author}</strong><small>{selected.region} · 베타 프로필</small></div><b>매너 {selected.manner}</b></div>
            <div className="detail-price"><div><small>{selected.type === "buy" ? "희망 가격" : "지원 금액"}</small><strong>{won(selected.price)}</strong></div><span>제안 {selected.offerCount + postOffers(selected.id).length} · 조회 {selected.views}</span></div>
            <div className="detail-copy"><h3>상세 내용</h3><p>{selected.description}</p></div>
            {selected.mine ? <>
              {/* [거래 상태 변경] + [급구 마감] */}
              <div className="status-actions"><button className={selected.status === "open" ? "active" : ""} onClick={() => changePostStatus(selected, "open")}>거래 가능</button><button className={selected.status === "reserved" ? "active" : ""} onClick={() => changePostStatus(selected, "reserved")}>진행 중</button><button className={selected.status === "closed" ? "active" : ""} onClick={() => changePostStatus(selected, "closed")}>{selected.type === "urgent" ? "급구 마감" : "거래 완료"}</button></div>
              <div className="owner-actions"><button onClick={() => { setEditor({ open: true, post: selected, type: selected.type }); setSelected(null); }}>수정</button><button onClick={() => removePost(selected)}>삭제</button></div>
              <div className="received-offers"><h3>받은 제안</h3>{postOffers(selected.id).filter((offer) => offer.direction === "incoming" && offer.status !== "canceled").map((offer) => <div key={offer.id}><span>{offer.nickname[0]}</span><p><strong>{offer.nickname} · {won(offer.price)}</strong><small>{offer.message}</small></p>{offer.status === "pending" ? <button onClick={() => acceptOffer(offer)}>이 제안으로 거래</button> : <button onClick={() => openChat(selected)}>1:1 채팅</button>}</div>)}{!postOffers(selected.id).some((offer) => offer.direction === "incoming" && offer.status !== "canceled") && <p className="offer-empty">아직 받은 제안이 없어요.</p>}</div>
            </> : (() => {
              const sentOffer = postOffers(selected.id).find((offer) => offer.direction === "outgoing" && offer.status !== "canceled");
              if (sentOffer?.status === "accepted") return <div className="deal-confirmed"><span>✓</span><div><strong>거래가 성사됐어요</strong><small>이제 두 사람만의 채팅방에서 약속을 정하세요.</small></div><button onClick={() => openChat(selected)}>1:1 채팅 열기</button></div>;
              if (sentOffer) return <div className="offer-waiting"><span>제안 검토 중</span><strong>{won(sentOffer.price)}</strong><p>상대가 이 제안을 선택하면 1:1 채팅방이 열립니다.</p><button onClick={() => cancelOffer(sentOffer.id)}>제안 취소</button></div>;
              if (selected.status === "closed") return <div className="closed-post-note"><span>✓</span><div><strong>{selected.type === "urgent" ? "마감된 급구예요" : "완료된 구매글이에요"}</strong><small>새 제안과 지원을 받지 않습니다.</small></div></div>;
              return <form className="offer-form" onSubmit={submitOffer}><h3>{selected.type === "buy" ? "판매 제안하기" : "지원하기"}</h3><label><span>닉네임</span><input name="nickname" defaultValue={nickname} minLength={2} required /></label><label><span>{selected.type === "buy" ? "제안 가격" : "지원 금액"}</span><div><input name="price" type="number" min="1000" step="1000" defaultValue={selected.price} required/><b>원</b></div></label><label><span>메시지</span><textarea name="message" minLength={3} required placeholder={selected.type === "buy" ? "물건 상태와 거래 가능 시간을 알려주세요." : "가능한 시간과 경험을 알려주세요."}/></label><div className="trade-gate"><span>🔒</span><p><strong>채팅은 거래 성사 후 열려요</strong>글쓴이가 제안을 선택하기 전에는 서로 연락할 수 없습니다.</p></div><button type="submit">{selected.type === "buy" ? "판매 제안 보내기" : "지원 보내기"}</button></form>;
            })()}
          </div>
        </section>
      </div>}

      {/* [판매 제안 관리] */}
      {tradeOpen && <div className="modal-layer" onMouseDown={() => setTradeOpen(false)}><section className="trade-center" onMouseDown={(event) => event.stopPropagation()}><div className="modal-handle"></div><header><button onClick={() => setTradeOpen(false)}>×</button><strong>판매 제안 관리</strong><span></span></header><div className="trade-scroll">
        {/* [받은 제안] */}
        <section><div className="trade-title"><h3>받은 제안</h3><b>{incomingOffers.filter((item) => item.status === "pending").length}</b></div>{incomingOffers.map((offer) => { const post = posts.find((item) => item.id === offer.postId); if (!post) return null; return <article className="trade-card incoming" key={offer.id}><div className="trade-card-top"><span>{offer.nickname[0]}</span><div><strong>{offer.nickname}</strong><small>{post.title}</small></div><b>{won(offer.price)}</b></div><p>{offer.message}</p>{offer.status === "pending" ? <div className="offer-decision"><button onClick={() => rejectOffer(offer.id)}>거절</button><button onClick={() => acceptOffer(offer)}>수락하고 거래</button></div> : <button onClick={() => openChat(post)}>성사된 1:1 채팅 열기</button>}</article>; })}</section>
        {/* [보낸 제안] */}
        <section><div className="trade-title"><h3>보낸 제안</h3><b>{outgoingOffers.length}</b></div>{outgoingOffers.map((offer) => { const post = posts.find((item) => item.id === offer.postId); if (!post) return null; return <article className="trade-card" key={offer.id}><div className="trade-card-top"><span>{post.author[0]}</span><div><strong>{post.author}</strong><small>{post.title}</small></div><b>{won(offer.price)}</b></div><p>{offer.message}</p>{offer.status === "pending" ? <div className="trade-status"><span>상대방 검토 중</span><div><button onClick={() => editOffer(offer)}>수정</button><button onClick={() => cancelOffer(offer.id)}>취소</button></div></div> : offer.status === "accepted" ? <button onClick={() => openChat(post)}>성사된 1:1 채팅 열기</button> : <div className="offer-result">{offer.status === "rejected" ? "거절된 제안" : "취소된 제안"}</div>}</article>; })}{!outgoingOffers.length && <div className="trade-empty">아직 보낸 제안이 없어요.</div>}</section>
      </div></section></div>}

      {chatListOpen && <div className="modal-layer" onMouseDown={() => setChatListOpen(false)}><section className="trade-center chat-list" onMouseDown={(event) => event.stopPropagation()}><div className="modal-handle"></div><header><button onClick={() => setChatListOpen(false)}>×</button><strong>1:1 거래 채팅</strong><span></span></header><div className="trade-scroll"><div className="chat-list-note"><span>🔒</span><p><strong>거래가 성사된 상대만 표시돼요</strong><small>제안 단계에서는 채팅이 열리지 않습니다.</small></p></div>{chatPosts.map((post) => <button className="chat-thread" key={post.id} onClick={() => openChat(post)}><span>{post.mine ? incomingOffers.find((offer) => offer.postId === post.id)?.nickname?.[0] ?? "상" : post.author[0]}</span><div><strong>{post.mine ? incomingOffers.find((offer) => offer.postId === post.id)?.nickname ?? "거래 상대" : post.author}</strong><small>{post.title}</small></div><p>{messages.filter((message) => message.postId === post.id).at(-1)?.text ?? "거래 채팅을 시작하세요."}</p><b>›</b></button>)}{!chatPosts.length && <div className="chat-list-empty"><span>말풍선</span><strong>열린 거래 채팅이 없어요</strong><p>제안이 선택되어 거래가 성사되면 이곳에 1:1 채팅방이 생깁니다.</p><button onClick={() => { setChatListOpen(false); setTradeOpen(true); }}>받은 제안 보기</button></div>}</div></section></div>}

      {/* [구매글 작성] + [급구 작성] */}
      {editor.open && <div className="modal-layer" onMouseDown={() => setEditor({ ...editor, open: false })}><section className="form-modal" onMouseDown={(event) => event.stopPropagation()}><div className="modal-handle"></div><header><button onClick={() => setEditor({ ...editor, open: false })}>×</button><strong>{editor.post ? "글 수정" : editor.type === "buy" ? "구매글 작성" : "급구 작성"}</strong><span></span></header><form onSubmit={savePost}><div className="editor-type"><button type="button" className={editor.type === "buy" ? "active" : ""} onClick={() => setEditor({ ...editor, type: "buy" })}>구매해요</button><button type="button" className={editor.type === "urgent" ? "urgent active" : ""} onClick={() => setEditor({ ...editor, type: "urgent" })}>급구</button></div><label><span>제목</span><input name="title" required maxLength={80} defaultValue={editor.post?.title} placeholder="무엇을 찾고 있나요?"/></label><div className="two-fields"><label><span>카테고리</span><select name="category" defaultValue={editor.post?.category ?? (editor.type === "urgent" ? "심부름" : "디지털")}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label><span>동네</span><select name="region" defaultValue={editor.post?.region ?? region}>{regions.map((item) => <option key={item}>{item}</option>)}</select></label></div><label><span>{editor.type === "buy" ? "희망 가격" : "지원 금액"}</span><div className="price-input"><input name="price" type="number" min="1000" step="1000" required defaultValue={editor.post?.price}/><b>원</b></div></label>{editor.type === "urgent" && <label><span>필요 시간</span><input name="deadline" defaultValue={editor.post?.deadline} placeholder="예: 오늘 18:00"/></label>}<label><span>상세 내용</span><textarea name="description" required minLength={10} maxLength={1200} defaultValue={editor.post?.description} placeholder="조건과 거래 방법을 구체적으로 적어주세요."/></label><div className="safe-tip"><span>✓</span><p><strong>베타 체험 안내</strong>실제 연락처, 계좌번호, 민감한 개인정보는 입력하지 마세요.</p></div><button className="form-submit" type="submit">{editor.post ? "수정 완료" : "글 등록하기"}</button></form></section></div>}

      {/* [채팅방] */}
      {chatPost && <div className="modal-layer" onMouseDown={() => setChatPost(null)}><section className="chat-modal" onMouseDown={(event) => event.stopPropagation()}><div className="modal-handle"></div><header><button onClick={() => setChatPost(null)}>←</button><div><strong>{chatCounterparty}</strong><small>{chatPost.title}</small></div><span className="online-dot"></span></header><div className="deal-chat-banner"><span>거래 성사</span><p>{won(chatOffer?.price ?? chatPost.price)} · {chatPost.region}</p><button onClick={() => setFeaturePanel("deal")}>거래 관리</button></div><div className="chat-notice">이 채팅은 거래가 성사된 두 사람에게만 열렸습니다.</div>
        {/* [메시지 전송] */}
        <div className="chat-messages">{activeMessages.map((message) => <div key={message.id} className={`chat-bubble ${message.sender}`}>{message.imageUrl && <img src={message.imageUrl} alt="거래 채팅 첨부 이미지"/>}<p>{message.text}</p><small>{message.time}</small></div>)}</div>
        <form className="chat-compose" onSubmit={sendMessage}>{/* [이미지 전송] */}<label aria-label="이미지 전송"><span>＋</span><input type="file" accept="image/*" onChange={sendChatImage}/></label><input name="message" autoComplete="off" placeholder="거래 시간과 장소를 정해보세요"/><button type="submit">↑</button></form>
      </section></div>}

      {/* [마이페이지] */}
      {settingsOpen && <div className="modal-layer my-layer" onMouseDown={() => setSettingsOpen(false)}><section className="my-page" onMouseDown={(event) => event.stopPropagation()}><header><button onClick={() => setSettingsOpen(false)}>←</button><strong>마이 찾구</strong><button className="notice-head" onClick={() => setNotices((items) => items.map((notice) => ({ ...notice, read: true })))}>알림 {unreadCount > 0 && <b>{unreadCount}</b>}</button></header><div className="my-scroll">
        <section className="profile-card"><label className="avatar-upload">{profileImage ? <img src={profileImage} alt="프로필 사진" /> : <span>{nickname[0]}</span>}<input type="file" accept="image/*" onChange={changeProfileImage}/><b>사진 변경</b></label><div><small>내 찾구 프로필</small><input value={nickname} minLength={2} maxLength={20} aria-label="닉네임" onChange={(event) => setNickname(event.target.value)}/><p>매너 신뢰도 <strong>36.5</strong> · 공개 베타 회원</p></div><button onClick={saveSettings}>저장</button></section>

        <section className="my-priority" aria-label="중요 활동"><button onClick={() => { setSettingsOpen(false); setChatListOpen(true); }}><span>●</span><strong>{chatPosts.length}</strong><small>최근 채팅</small></button><button onClick={() => { setSettingsOpen(false); setTradeOpen(true); }}><span>⇄</span><strong>{pendingIncomingCount}</strong><small>받은 제안</small></button><button onClick={() => document.getElementById("saved-all")?.scrollIntoView({ behavior: "smooth" })}><span>♥</span><strong>{savedPosts.length}</strong><small>찜 목록</small></button></section>

        {/* [마이페이지] */}
        <section className="my-menu-grid"><button onClick={() => { setSettingsOpen(false); setFeaturePanel("account"); }}><span>♙</span><strong>내 정보</strong><small>회원·지역·관심 설정</small></button><button onClick={() => { setSettingsOpen(false); setFeaturePanel("activity"); }}><span>▤</span><strong>내가 작성한 글</strong><small>구매글 {myPosts.filter((post) => post.type === "buy").length} · 급구 {myPosts.filter((post) => post.type === "urgent").length}</small></button><button onClick={() => { setSettingsOpen(false); setFeaturePanel("deal"); }}><span>✓</span><strong>거래 내역</strong><small>진행·완료·취소</small></button><button onClick={() => { setSettingsOpen(false); setFeaturePanel("trust"); }}><span>36.5</span><strong>신뢰도</strong><small>평점과 받은 후기</small></button><button onClick={() => { setSettingsOpen(false); setFeaturePanel("support"); }}><span>?</span><strong>고객센터</strong><small>FAQ · 1:1 문의</small></button><button onClick={() => { setSettingsOpen(false); setFeaturePanel("all"); }}><span>▦</span><strong>전체 기능</strong><small>기능명세 전체 보기</small></button></section>

        <section className="my-section"><div className="my-title"><div><small>ACTIVITY</small><h3>최근 채팅과 제안</h3></div><button onClick={() => { setSettingsOpen(false); setTradeOpen(true); }}>전체 제안 ›</button></div>{chatPosts.slice(0, 2).map((post) => <button className="my-chat-row" key={post.id} onClick={() => openChat(post)}><span>{post.author[0]}</span><div><strong>{post.author}</strong><small>{messages.filter((message) => message.postId === post.id).at(-1)?.text ?? post.title}</small></div><time>방금</time></button>)}{pendingIncomingCount > 0 && <button className="my-offer-alert" onClick={() => { setSettingsOpen(false); setTradeOpen(true); }}><span>새 제안 {pendingIncomingCount}</span><strong>확인이 필요한 거래 요청이 있어요</strong><b>확인 ›</b></button>}</section>

        <section className="my-section"><div className="my-title"><div><small>NOTIFICATIONS</small><h3>알림</h3></div>{unreadCount > 0 && <button onClick={() => setNotices((items) => items.map((notice) => ({ ...notice, read: true })))}>모두 읽음</button>}</div><div className="notice-list">{notices.slice(0, 5).map((notice) => <button className={notice.read ? "read" : ""} key={notice.id} onClick={() => { setNotices((items) => items.map((item) => item.id === notice.id ? { ...item, read: true } : item)); if (notice.postId) openPost(notice.postId); }}><span>{notice.kind === "chat" ? "말" : notice.kind === "keyword" ? "#" : notice.kind === "offer" ? "⇄" : "✓"}</span><div><strong>{notice.title}</strong><small>{notice.body}</small></div><time>{notice.time}</time></button>)}{!notices.length && <p className="my-empty">새 알림이 없어요.</p>}</div><div className="push-card"><span>{pushEnabled ? "✓" : "♧"}</span><div><strong>앱 푸시 알림</strong><small>거래 요청·수락, 1:1 채팅, 관심 키워드를 알려드려요.</small></div>{pushEnabled ? <button onClick={() => deliverNotice("찾구 테스트 알림", "앱 알림이 정상적으로 연결됐어요.", "system")}>테스트</button> : <button onClick={requestPushNotifications}>알림 켜기</button>}</div></section>

        {/* [찜 목록] */}
        <section className="my-section" id="saved-all"><div className="my-title"><div><small>SAVED</small><h3>찜 목록</h3></div><b>{savedPosts.length}</b></div>{savedPosts.map((post) => <button className="saved-urgent-row" key={post.id} onClick={() => openPost(post.id)}><span>{post.type === "urgent" ? "ϟ" : "◎"}</span><div><strong>{post.title}</strong><small>{post.type === "urgent" ? "급구" : "구매글"} · {post.region} · {won(post.price)}</small></div><b>›</b></button>)}{!savedPosts.length && <p className="my-empty">글의 하트를 누르면 이곳에 모아볼 수 있어요.</p>}</section>

        <section className="my-section"><div className="my-title"><div><small>MY AREA</small><h3>거주 및 활동 지역</h3></div><span>최대 3곳</span></div><label className="primary-region"><span>대표 동네</span><select value={region} onChange={(event) => setRegion(event.target.value)}>{regions.map((item) => <option key={item}>{item}</option>)}</select></label><div className="choice-chips">{regions.map((item) => <button className={activityRegions.includes(item) ? "selected" : ""} key={item} onClick={() => toggleChoice(item, activityRegions, setActivityRegions, 3)}>{activityRegions.includes(item) ? "✓ " : "+ "}{item}</button>)}</div></section>

        <section className="my-section"><div className="my-title"><div><small>INTERESTS</small><h3>관심 카테고리</h3></div><span>맞춤 추천에 사용</span></div><div className="choice-chips">{categories.slice(1).map((item) => <button className={interestCategories.includes(item) ? "selected" : ""} key={item} onClick={() => toggleChoice(item, interestCategories, setInterestCategories)}>{interestCategories.includes(item) ? "✓ " : "+ "}{item}</button>)}</div></section>

        <section className="my-section"><div className="my-title"><div><small>KEYWORD ALERTS</small><h3>관심 키워드 알림</h3></div><span>최대 8개</span></div><p className="section-help">구매글이나 급구에 등록한 단어가 올라오면 바로 알려드려요.</p><form className="keyword-form" onSubmit={addKeyword}><input name="keyword" maxLength={20} placeholder="예: 아이패드, 팝업, 촬영 보조"/><button type="submit">추가</button></form><div className="keyword-list">{keywords.map((keyword) => <button key={keyword} onClick={() => setKeywords((items) => items.filter((item) => item !== keyword))}>#{keyword}<span>×</span></button>)}</div></section>

        {/* [앱 색상] */}
        <section className="my-section theme-settings"><div className="my-title"><div><small>APP COLOR</small><h3>앱 색상</h3></div><span>{activeTheme.label} 사용 중</span></div><p className="section-help">다섯 가지 감성 색상 중 원하는 분위기를 골라보세요.</p><div className="theme-picker">{themeOptions.map((option) => <button key={option.id} className={theme === option.id ? "selected" : ""} aria-pressed={theme === option.id} onClick={() => setTheme(option.id)}><span className="theme-swatches">{option.colors.map((color) => <i key={color} style={{ background: color }} />)}</span><strong>{option.label}</strong>{theme === option.id && <b>✓</b>}</button>)}</div></section>
        {/* [로그아웃] + [회원 탈퇴] + [관리자] */}
        <section className="account-danger-zone"><button onClick={() => { setSettingsOpen(false); setFeaturePanel("admin"); }}>관리자 데모</button><button onClick={() => handleFeatureAction("my-logout", "로그아웃")}>로그아웃</button><button className="danger" onClick={() => handleFeatureAction("my-withdraw", "회원 탈퇴")}>회원 탈퇴</button></section>
        <p className="beta-storage-note">현재 공개 베타에서는 프로필·찜·키워드가 이 기기에 저장됩니다. 정식 회원 서버 연결 후 계정별로 동기화됩니다.</p><button className="my-save" onClick={saveSettings}>설정 저장하고 닫기</button>
      </div></section></div>}

      {/* [전체 기능 관리] */}
      {featurePanel && <FeaturePanel panel={featurePanel} viewer={viewer} onClose={() => setFeaturePanel(null)} onAction={handleFeatureAction}/>}

      {/* [1:1 문의] */}
      {supportOpen && <div className="modal-layer" onMouseDown={() => setSupportOpen(false)}><section className="form-modal support-modal" onMouseDown={(event) => event.stopPropagation()}><header><button onClick={() => setSupportOpen(false)}>×</button><strong>1:1 문의</strong><span></span></header><form onSubmit={submitSupport}><div className="support-guide"><span>?</span><p><strong>무엇을 도와드릴까요?</strong><small>오류, 거래 문제, 기능 제안을 자유롭게 적어주세요.</small></p></div><label><span>문의 제목</span><input name="subject" required maxLength={80} placeholder="문의 내용을 요약해 주세요."/></label><label><span>상세 내용</span><textarea name="body" required minLength={10} maxLength={1200} placeholder="확인이 필요한 내용을 10자 이상 적어 주세요."/></label><button className="form-submit" type="submit">문의 접수</button></form></section></div>}

      {termsOpen && <div className="modal-layer" onMouseDown={() => setTermsOpen(false)}><section className="terms-modal" onMouseDown={(event) => event.stopPropagation()}><header><button onClick={() => setTermsOpen(false)}>×</button><strong>베타 이용 안내</strong><span></span></header><div><h3>로그인 없는 체험판</h3><p>현재 버전은 기능과 화면 흐름을 확인하는 공개 베타입니다. 작성한 글, 제안, 채팅은 사용 중인 브라우저에만 저장됩니다.</p><h3>안전한 이용</h3><p>실제 개인정보, 계좌번호, 연락처를 입력하지 마세요. 불법 물품이나 타인의 권리를 침해하는 요청은 등록할 수 없습니다.</p><h3>초기화</h3><p>브라우저의 사이트 데이터를 삭제하면 직접 작성한 베타 데이터도 함께 사라집니다.</p></div><button onClick={() => setTermsOpen(false)}>확인했어요</button></section></div>}
      {toast && <div className="app-toast"><span>✓</span>{toast}</div>}
    </main>
  );
}
