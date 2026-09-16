"use client";

import { useRouter } from "next/navigation";
import { LandingHero } from "@/src/components/home/LandingHero";
import { MarketPreviewSection } from "@/src/components/home/MarketPreviewSection";
import { SiteFooter } from "@/src/components/home/SiteFooter";
import { TrustSection } from "@/src/components/home/TrustSection";
import { useAuth } from "@/src/state/AuthProvider";

// [홈] 로그아웃 상태에서는 마케팅 랜딩 화면을, 로그인 상태에서는 짧은 환영 인사 뒤에
// 바로 최근 글 미리보기를 보여줍니다. 목록 자체는 /buy, /urgent 전용 페이지가 담당합니다.
export function HomePage() {
  const { session, profile, initializing } = useAuth();
  const router = useRouter();

  if (initializing) return <div className="page"><p>불러오는 중…</p></div>;

  return (
    <>
      {session ? (
        <section className="app-overview">
          <div className="welcome-row">
            <div><span>⌖ {profile?.region ?? "지역 미설정"}</span><h1>무엇을 찾고 있나요?</h1><p>원하는 물건이나 도움이 필요한 일을 먼저 올려보세요.</p></div>
          </div>
          <div className="home-actions">
            <button onClick={() => router.push("/post/new?type=buy")}><span className="action-icon buy">＋</span><div><strong>구매글 올리기</strong><small>찾는 물건을 알려주세요</small></div><b>›</b></button>
            <button onClick={() => router.push("/post/new?type=urgent")}><span className="action-icon urgent">ϟ</span><div><strong>급구 올리기</strong><small>사람과 심부름을 구해요</small></div><b>›</b></button>
          </div>
        </section>
      ) : (
        <LandingHero />
      )}

      <MarketPreviewSection type="buy" title="이웃이 찾는 물건" />
      <MarketPreviewSection type="urgent" title="지금 필요한 도움" />

      {!session && <TrustSection />}
      <SiteFooter />
    </>
  );
}
