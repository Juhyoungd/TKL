"use client";

import type { AppNotice, Post } from "@/src/types/findgoo";

type UseDealActionsArgs = {
  chatPost: Post | null;
  selected: Post | null;
  changePostStatus: (post: Post, status: Post["status"]) => void;
  deliverNotice: (title: string, body: string, kind: AppNotice["kind"], postId?: string) => void;
  flash: (message: string) => void;
};

// [거래 완료] + [거래 취소] + [후기 작성] + [신고] + [차단]
// 현재 열려 있는 채팅 또는 상세 글을 대상으로 거래 관리 액션을 실행합니다.
export function useDealActions({ chatPost, selected, changePostStatus, deliverNotice, flash }: UseDealActionsArgs) {
  function runDealAction(actionId: string) {
    const post = chatPost ?? selected;
    if (!post) { flash("먼저 거래 글이나 채팅을 선택해 주세요."); return; }
    if (actionId === "deal-complete") { changePostStatus(post, "closed"); deliverNotice("거래가 완료됐어요", "상대방에게 후기를 남겨보세요.", "trade", post.id); return; }
    if (actionId === "deal-cancel") { if (window.confirm("이 거래를 취소할까요?")) { changePostStatus(post, "open"); flash("거래를 취소하고 글을 다시 열었어요."); } return; }
    if (actionId === "review-create") { const review = window.prompt("거래 후기를 입력해 주세요."); if (review?.trim()) flash("후기를 등록했어요. 신뢰도에 반영됩니다."); return; }
    if (actionId === "report") { const reason = window.prompt("신고 사유를 입력해 주세요."); if (reason?.trim()) flash("신고를 접수했어요. 고객센터에서 확인합니다."); return; }
    if (actionId === "block" && window.confirm(`${post.author}님을 차단할까요?`)) flash("사용자를 차단했어요.");
  }

  return { runDealAction };
}
