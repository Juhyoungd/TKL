"use client";

import { faqItems, featureSpecification } from "@/src/constants/feature-spec";
import type { FeaturePanelKey, Viewer } from "@/src/types/findgoo";

type FeaturePanelProps = {
  panel: FeaturePanelKey;
  viewer: Viewer;
  onClose: () => void;
  onAction: (actionId: string, actionLabel: string) => void;
};

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

export function FeaturePanel({ panel, viewer, onClose, onAction }: FeaturePanelProps) {
  const groups = featureSpecification.filter((group) => panelGroups[panel].includes(group.id));

  return (
    <div className="modal-layer feature-layer" onMouseDown={onClose}>
      <section className="feature-panel" onMouseDown={(event) => event.stopPropagation()}>
        {/* [전체 기능 관리] */}
        <header><button onClick={onClose}>←</button><strong>{panelTitles[panel]}</strong><span>{groups.length}</span></header>
        <div className="feature-scroll">
          {/* [회원] */}
          {(panel === "account" || panel === "all") && <section className="auth-choice-card"><div><small>ACCOUNT</small><h2>{viewer ? `${viewer.displayName}님` : "찾구 시작하기"}</h2><p>{viewer ? viewer.email : "회원으로 동기화하거나 비회원으로 먼저 체험할 수 있어요."}</p></div>{viewer ? <a href="/signout-with-chatgpt?return_to=/">로그아웃</a> : <div className="login-options"><a href="/signin-with-chatgpt?return_to=/"><span>◉</span>ChatGPT로 계속</a><button onClick={() => onAction("naver-login", "네이버 로그인")}><span>N</span>네이버</button><button onClick={() => onAction("google-login", "구글 로그인")}><span>G</span>구글</button><button onClick={() => onAction("guest-login", "비회원 로그인")}><span>⌁</span>비회원</button></div>}</section>}

          {/* [고객센터] */}
          {panel === "support" && <section className="faq-block"><div className="feature-block-title"><small>FAQ</small><h3>자주 묻는 질문</h3></div>{faqItems.map((item) => <details key={item.question}><summary>{item.question}<span>＋</span></summary><p>{item.answer}</p></details>)}</section>}

          {/* [관리자] */}
          {panel === "admin" && <section className="admin-overview"><span><b>1,284</b><small>활성 회원</small></span><span><b>12</b><small>처리할 신고</small></span><span><b>7</b><small>미답변 문의</small></span></section>}

          {/* [기능명세] */}
          <section className="feature-spec-list">
            {groups.map((group, groupIndex) => <details key={group.id} open={panel !== "all" || groupIndex < 2}><summary><span>{group.icon}</span><div><strong>{group.label}</strong><small>{group.summary}</small></div><b>{group.actions.length}</b></summary><div className="feature-actions">{group.actions.map((action) => <button className={action.danger ? "danger" : ""} key={action.id} onClick={() => onAction(action.id, action.label)}><div><strong>{action.label}</strong><small>{action.description}</small></div><span>›</span></button>)}</div></details>)}
          </section>
        </div>
      </section>
    </div>
  );
}
