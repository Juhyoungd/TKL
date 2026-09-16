"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { faqItems, featureSpecification } from "@/src/constants/feature-spec";
import { useAuth } from "@/src/state/AuthProvider";
import { useToast } from "@/src/state/ToastProvider";
import type { FeaturePanelKey } from "@/src/types/findgoo";

const panelTitles: Record<FeaturePanelKey, string> = {
  all: "전체 기능 관리",
  account: "회원 및 계정",
  activity: "나의 활동",
  deal: "거래 관리",
  support: "고객센터",
  admin: "관리자",
  trust: "신뢰도",
};

const panelGroups: Record<FeaturePanelKey, string[]> = {
  all: featureSpecification.map((group) => group.id),
  account: ["member", "mypage"],
  activity: ["purchase", "urgent", "offer", "favorite", "search", "notice"],
  deal: ["deal", "chat", "offer"],
  support: ["support"],
  admin: ["admin"],
  trust: ["deal"],
};

const routeByAction: Record<string, string> = {
  "purchase-view": "/buy", "purchase-search": "/buy", "search-keyword": "/buy", "search-category": "/buy",
  "search-region": "/buy", "search-price": "/buy", "sort-latest": "/buy", "sort-popular": "/buy",
  "urgent-view": "/urgent", "urgent-apply": "/urgent",
  "offer-receive": "/offers", "offer-create": "/offers", "offer-edit": "/offers", "offer-cancel": "/offers",
  "offer-accept": "/offers", "offer-reject": "/offers", "my-offers": "/offers",
  "chat-create": "/chat", "chat-send": "/chat", "chat-image": "/chat", "my-chats": "/chat",
  terms: "/terms",
  "inquiry-create": "/support",
  "region-setting": "/profile", "category-setting": "/profile", "account-edit": "/profile", "my-profile": "/profile",
  "my-notices": "/profile", "my-posts": "/profile", "my-deals": "/offers", "my-favorites": "/profile",
  "my-trust": "/profile",
};

// [전체 기능 관리]
export default function FeaturesPage() {
  return (
    <Suspense fallback={<div className="page"><p>불러오는 중…</p></div>}>
      <FeaturesContent />
    </Suspense>
  );
}

function FeaturesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session, profile, signOut, deleteAccount } = useAuth();
  const { flash } = useToast();

  const requested = searchParams.get("panel") as FeaturePanelKey | null;
  const panel: FeaturePanelKey = requested && panelTitles[requested] ? requested : "all";
  const groups = featureSpecification.filter((group) => panelGroups[panel].includes(group.id));

  async function handleAction(actionId: string, actionLabel: string) {
    if (actionId === "purchase-create") { router.push("/post/new?type=buy"); return; }
    if (actionId === "urgent-create") { router.push("/post/new?type=urgent"); return; }
    if (routeByAction[actionId]) { router.push(routeByAction[actionId]); return; }
    if (actionId === "logout" || actionId === "my-logout") { await signOut(); flash("로그아웃했어요."); router.push("/"); return; }
    if (actionId === "withdraw" || actionId === "my-withdraw") {
      if (window.confirm("정말 회원 탈퇴를 요청할까요? 되돌릴 수 없어요.")) {
        const result = await deleteAccount();
        flash(result.error ?? "회원 탈퇴가 완료됐어요.");
        if (!result.error) router.push("/");
      }
      return;
    }
    if (actionId.startsWith("admin-")) { flash(`${actionLabel} 운영 화면을 열었어요.`); return; }
    flash(`${actionLabel} 기능 흐름을 확인했어요.`);
  }

  return (
    <div className="page">
      <h1 className="page-title">{panelTitles[panel]}</h1>
      <section className="page-card">
        {(panel === "account" || panel === "all") && (
          <section className="auth-choice-card">
            <div><small>ACCOUNT</small><h2>{session ? `${profile?.nickname ?? "회원"}님` : "찾구 시작하기"}</h2><p>{session ? profile?.name : "로그인하고 글을 올리거나 제안을 보내보세요."}</p></div>
            {session ? (
              <button onClick={() => handleAction("logout", "로그아웃")}>로그아웃</button>
            ) : (
              <div className="login-options">
                <Link href="/signin"><span>◉</span>로그인</Link>
                <Link href="/signup"><span>＋</span>회원가입</Link>
              </div>
            )}
          </section>
        )}

        {panel === "support" && (
          <section className="faq-block">
            <div className="feature-block-title"><small>FAQ</small><h3>자주 묻는 질문</h3></div>
            {faqItems.map((item) => <details key={item.question}><summary>{item.question}<span>＋</span></summary><p>{item.answer}</p></details>)}
          </section>
        )}

        <section className="feature-spec-list">
          {groups.map((group, groupIndex) => (
            <details key={group.id} open={panel !== "all" || groupIndex < 2}>
              <summary><span>{group.icon}</span><div><strong>{group.label}</strong><small>{group.summary}</small></div><b>{group.actions.length}</b></summary>
              <div className="feature-actions">
                {group.actions.map((action) => (
                  <button className={action.danger ? "danger" : ""} key={action.id} onClick={() => handleAction(action.id, action.label)}>
                    <div><strong>{action.label}</strong><small>{action.description}</small></div><span>›</span>
                  </button>
                ))}
              </div>
            </details>
          ))}
        </section>
      </section>
    </div>
  );
}
