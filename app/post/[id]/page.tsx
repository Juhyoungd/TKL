"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAppData } from "@/src/state/AppDataProvider";
import { useAuth } from "@/src/state/AuthProvider";
import { useOfferActions } from "@/src/hooks/use-offer-actions";
import { useToast } from "@/src/state/ToastProvider";
import { won } from "@/src/utils/format";
import type { Offer, Post } from "@/src/types/findgoo";

// [구매글 조회] + [급구 조회] — 로그인 없이도 볼 수 있는 공개 페이지입니다.
export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const appData = useAppData();
  const { session, profile } = useAuth();
  const { flash } = useToast();
  const offerActions = useOfferActions();

  // appData.posts에 이미 있으면 그 값을 그대로 쓰고(실시간으로 항상 최신), 없을 때만
  // (직접 링크로 들어온 경우 등) 별도로 조회합니다. id가 바뀌면 렌더링 중에 바로 초기화합니다.
  const [fetchedPost, setFetchedPost] = useState<Post | null | undefined>(undefined);
  const [fetchedFor, setFetchedFor] = useState<string | null>(null);
  if (id !== fetchedFor) {
    setFetchedFor(id);
    setFetchedPost(undefined);
  }

  useEffect(() => {
    if (appData.posts.some((item) => item.id === id)) return;
    let cancelled = false;
    appData.getPost(id).then((result) => { if (!cancelled) setFetchedPost(result); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, appData.posts]);

  const post = appData.posts.find((item) => item.id === id) ?? fetchedPost;
  const backHref = post ? (post.type === "buy" ? "/buy" : "/urgent") : "/buy";

  if (post === undefined) return <div className="page"><p>불러오는 중…</p></div>;
  if (post === null) {
    return (
      <div className="page">
        <Link className="page-back" href={backHref}>← 목록으로</Link>
        <p>존재하지 않거나 삭제된 글이에요.</p>
      </div>
    );
  }

  const offers = offerActions.postOffers(post.id);
  const isSaved = appData.savedPostIds.includes(post.id);
  const nickname = profile?.nickname || profile?.name || "회원";

  async function handleAccept(offer: Offer) {
    const { error } = await offerActions.acceptOffer(offer);
    if (error) flash(error);
  }

  async function handleChangeStatus(status: Post["status"]) {
    if (!post) return;
    const { error } = await appData.updatePostStatus(post.id, status);
    if (error) { flash("상태를 변경하지 못했어요."); return; }
    flash(status === "open" ? "거래 가능 상태로 변경했어요." : status === "reserved" ? "거래 진행 중으로 변경했어요." : post.type === "urgent" ? "급구를 마감했어요." : "거래를 완료했어요.");
  }

  async function handleRemove() {
    if (!post || !window.confirm("이 글을 삭제할까요?")) return;
    const { error } = await appData.removePost(post.id);
    if (error) { flash("글을 삭제하지 못했어요."); return; }
    flash("글을 삭제했어요.");
    router.push(post.type === "buy" ? "/buy" : "/urgent");
  }

  return (
    <div className="page">
      <Link className="page-back" href={backHref}>← 목록으로</Link>
      <section className="page-card">
        <div className="detail-tags">
          <span className={`post-type ${post.type}`}>{post.type === "buy" ? "구매해요" : "급구"}</span>
          <span className="post-category">{post.category}</span>
          <span className={`post-status ${post.status}`}>{post.status === "open" ? "거래 가능" : post.status === "reserved" ? "진행 중" : "마감"}</span>
          {post.deadline && <b>{post.deadline}</b>}
          <button
            aria-label={isSaved ? "찜 취소" : "찜하기"}
            style={{ marginLeft: "auto", border: 0, background: "transparent", fontSize: 18, cursor: "pointer" }}
            onClick={() => (session ? appData.toggleSaved(post.id) : flash("로그인하고 찜할 수 있어요."))}
          >
            {isSaved ? "♥" : "♡"}
          </button>
        </div>
        <h2>{post.title}</h2>
        <div className="author-row">
          <span>{post.author[0]}</span>
          <div><strong>{post.author}</strong><small>{post.region}</small></div>
          <b>매너 {post.manner}</b>
        </div>
        <div className="detail-price">
          <div><small>{post.type === "buy" ? "희망 가격" : "지원 금액"}</small><strong>{won(post.price)}</strong></div>
          <span>제안 {post.offerCount} · 조회 {post.views}</span>
        </div>
        <div className="detail-copy"><h3>상세 내용</h3><p>{post.description}</p></div>

        {post.mine ? (
          <>
            <div className="status-actions">
              <button className={post.status === "open" ? "active" : ""} onClick={() => handleChangeStatus("open")}>거래 가능</button>
              <button className={post.status === "reserved" ? "active" : ""} onClick={() => handleChangeStatus("reserved")}>진행 중</button>
              <button className={post.status === "closed" ? "active" : ""} onClick={() => handleChangeStatus("closed")}>{post.type === "urgent" ? "급구 마감" : "거래 완료"}</button>
            </div>
            <div className="owner-actions">
              <button onClick={() => router.push(`/post/${post.id}/edit`)}>수정</button>
              <button onClick={handleRemove}>삭제</button>
            </div>
            <div className="received-offers">
              <h3>받은 제안</h3>
              {offers.filter((offer) => offer.direction === "incoming" && offer.status !== "canceled").map((offer) => (
                <div key={offer.id}>
                  <span>{offer.nickname[0]}</span>
                  <p><strong>{offer.nickname} · {won(offer.price)}</strong><small>{offer.message}</small></p>
                  {offer.status === "pending" ? <button onClick={() => handleAccept(offer)}>이 제안으로 거래</button> : <button onClick={() => offerActions.goToOfferChat(offer)}>1:1 채팅</button>}
                </div>
              ))}
              {!offers.some((offer) => offer.direction === "incoming" && offer.status !== "canceled") && <p className="offer-empty">아직 받은 제안이 없어요.</p>}
            </div>
          </>
        ) : session ? (
          <PostDetailBuyerPanel post={post} offers={offers} nickname={nickname} offerActions={offerActions} flash={flash} />
        ) : (
          <div className="trade-gate">
            <span>🔒</span>
            <p><strong>로그인하고 제안을 보내보세요</strong>제안이 수락되면 1:1 채팅이 열립니다.</p>
            <Link href={`/signin?returnTo=${encodeURIComponent(`/post/${post.id}`)}`} className="form-submit" style={{ display: "block", textAlign: "center", textDecoration: "none", marginTop: 10 }}>로그인</Link>
          </div>
        )}
      </section>
    </div>
  );
}

type PostDetailBuyerPanelProps = {
  post: Post;
  offers: Offer[];
  nickname: string;
  offerActions: ReturnType<typeof useOfferActions>;
  flash: (message: string) => void;
};

function PostDetailBuyerPanel({ post, offers, nickname, offerActions, flash }: PostDetailBuyerPanelProps) {
  const sentOffer = offers.find((offer) => offer.direction === "outgoing" && offer.status !== "canceled");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await offerActions.submitOffer(post.id, String(form.get("nickname")), Number(form.get("price")), String(form.get("message")));
    if (error) { flash(error); return; }
    flash("제안을 보냈어요. 상대가 선택하면 1:1 채팅이 열립니다.");
  }

  async function handleCancel(offerId: string) {
    const { error } = await offerActions.cancelOffer(offerId);
    flash(error ?? "제안을 취소했어요.");
  }

  if (sentOffer?.status === "accepted") {
    return (
      <div className="deal-confirmed">
        <span>✓</span>
        <div><strong>거래가 성사됐어요</strong><small>이제 두 사람만의 채팅방에서 약속을 정하세요.</small></div>
        <button onClick={() => offerActions.goToOfferChat(sentOffer)}>1:1 채팅 열기</button>
      </div>
    );
  }

  if (sentOffer) {
    return (
      <div className="offer-waiting">
        <span>제안 검토 중</span>
        <strong>{won(sentOffer.price)}</strong>
        <p>상대가 이 제안을 선택하면 1:1 채팅방이 열립니다.</p>
        <button onClick={() => handleCancel(sentOffer.id)}>제안 취소</button>
      </div>
    );
  }

  if (post.status === "closed") {
    return (
      <div className="closed-post-note">
        <span>✓</span>
        <div><strong>{post.type === "urgent" ? "마감된 급구예요" : "완료된 구매글이에요"}</strong><small>새 제안과 지원을 받지 않습니다.</small></div>
      </div>
    );
  }

  return (
    <form className="offer-form" onSubmit={handleSubmit}>
      <h3>{post.type === "buy" ? "판매 제안하기" : "지원하기"}</h3>
      <label><span>닉네임</span><input name="nickname" defaultValue={nickname} minLength={2} required /></label>
      <label><span>{post.type === "buy" ? "제안 가격" : "지원 금액"}</span><div><input name="price" type="number" min="1000" step="1000" defaultValue={post.price} required /><b>원</b></div></label>
      <label><span>메시지</span><textarea name="message" minLength={3} required placeholder={post.type === "buy" ? "물건 상태와 거래 가능 시간을 알려주세요." : "가능한 시간과 경험을 알려주세요."} /></label>
      <div className="trade-gate"><span>🔒</span><p><strong>채팅은 거래 성사 후 열려요</strong>글쓴이가 제안을 선택하기 전에는 서로 연락할 수 없습니다.</p></div>
      <button type="submit">{post.type === "buy" ? "판매 제안 보내기" : "지원 보내기"}</button>
    </form>
  );
}
