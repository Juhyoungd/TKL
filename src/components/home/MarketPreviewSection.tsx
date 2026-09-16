"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PostCard } from "@/src/components/market/PostCard";
import { useAppData } from "@/src/state/AppDataProvider";
import { useAuth } from "@/src/state/AuthProvider";
import { useToast } from "@/src/state/ToastProvider";
import type { Post, PostType } from "@/src/types/findgoo";

// [홈 미리보기] /buy, /urgent 전체 목록으로 이어지는 최신 글 몇 개만 보여줍니다.
export function MarketPreviewSection({ type, title }: { type: PostType; title: string }) {
  const router = useRouter();
  const appData = useAppData();
  const { session } = useAuth();
  const { flash } = useToast();

  const preview = appData.posts.filter((post) => post.type === type).slice(0, 4);
  const listHref = type === "buy" ? "/buy" : "/urgent";

  function openPost(post: Post) {
    router.push(`/post/${post.id}`);
  }

  function toggleSaved(post: Post) {
    if (!session) { flash("로그인하고 찜할 수 있어요."); return; }
    const saved = appData.savedPostIds.includes(post.id);
    appData.toggleSaved(post.id);
    flash(saved ? "찜에서 삭제했어요." : "관심글로 저장했어요.");
  }

  return (
    <section className="market-section">
      <div className="market-heading">
        <div><span className="section-label">NEARBY</span><h2>{title}</h2></div>
        <Link href={listHref} className="section-more-link">전체 보기 ›</Link>
      </div>
      <div className="post-grid">
        {preview.map((post) => (
          <PostCard key={post.id} post={post} saved={appData.savedPostIds.includes(post.id)} onOpen={openPost} onToggleSaved={toggleSaved} />
        ))}
        {!preview.length && (
          <div className="empty-market">
            <span>⌕</span>
            <strong>아직 등록된 글이 없어요</strong>
            <p>첫 글을 올려서 이웃에게 알려보세요.</p>
            <Link href={session ? `/post/new?type=${type}` : `/signin?returnTo=${encodeURIComponent(`/post/new?type=${type}`)}`}>글 올리기</Link>
          </div>
        )}
      </div>
    </section>
  );
}
