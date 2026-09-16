"use client";

import { useRouter } from "next/navigation";
import { useAppData } from "@/src/state/AppDataProvider";
import { won } from "@/src/utils/format";

// [랜딩 히어로] 로그아웃 상태의 첫 화면. 실제 등록된 글로 실시간 마켓 느낌을 보여줍니다.
export function LandingHero() {
  const router = useRouter();
  const appData = useAppData();
  const posts = appData.posts;
  const buyCount = posts.filter((post) => post.type === "buy").length;
  const urgentCount = posts.filter((post) => post.type === "urgent").length;
  const recentPosts = posts.slice(0, 3);
  const latestPost = posts[0];

  return (
    <>
      <section className="find-hero">
        <div className="hero-left">
          <span className="hero-label">REVERSE MARKET</span>
          <h1>사고 싶은 걸 먼저 <em>올리면</em><br />이웃이 제안해요</h1>
          <p>구매글이나 급한 도움을 올리면 판매자·지원자가 가격과 조건을 제안합니다. 제안이 수락된 거래만 1:1 채팅이 열려요.</p>
          <div className="hero-buttons">
            <button className="main-cta" onClick={() => router.push("/signup")}>지금 시작하기 <b>무료</b></button>
            <button className="urgent-cta" onClick={() => router.push("/urgent")}>급구 둘러보기<span>LIVE</span></button>
          </div>
          <div className="hero-proof">
            <span><b>{posts.length}</b>등록된 글</span>
            <i />
            <span><b>{buyCount}</b>구매글</span>
            <i />
            <span><b>{urgentCount}</b>급구</span>
          </div>
        </div>
        <div className="hero-board">
          <div className="board-top"><span>LIVE MARKET</span><strong>지금 올라온 글</strong></div>
          <ol>
            {recentPosts.map((post) => (
              <li key={post.id}>
                <span>{post.type === "urgent" ? "ϟ" : "◎"}</span>
                <div><strong>{post.title}</strong><small>{post.region} · {won(post.price)}</small></div>
              </li>
            ))}
            {!recentPosts.length && (
              <li><span>◎</span><div><strong>아직 등록된 글이 없어요</strong><small>첫 글의 주인공이 되어보세요</small></div></li>
            )}
          </ol>
          <div className="board-ticket">
            <span>지금 가장 활발한 카테고리</span>
            <strong>{mostCommonCategory(posts)}</strong>
            <b>HOT</b>
          </div>
        </div>
      </section>

      <div className="quick-strip">
        <div><span className="live-dot"></span>실시간</div>
        <div className="ticker">
          {latestPost ? (
            <><span>NEW</span><b>{latestPost.title}</b><em>{won(latestPost.price)}</em><i>{latestPost.region}</i></>
          ) : (
            <span>아직 등록된 글이 없어요. 첫 글을 올려보세요!</span>
          )}
        </div>
        <button onClick={() => router.push("/buy")}>전체 보기</button>
      </div>
    </>
  );
}

function mostCommonCategory(posts: ReturnType<typeof useAppData>["posts"]) {
  if (!posts.length) return "전체";
  const counts = new Map<string, number>();
  for (const post of posts) counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}
