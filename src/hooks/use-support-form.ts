"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { createSupportTicket } from "@/src/api/findgoo-client";
import type { Viewer } from "@/src/types/findgoo";

type UseSupportFormArgs = {
  viewer: Viewer;
  setSupportOpen: Dispatch<SetStateAction<boolean>>;
  flash: (message: string) => void;
};

// [1:1 문의] 고객센터 문의 접수를 담당합니다.
export function useSupportForm({ viewer, setSupportOpen, flash }: UseSupportFormArgs) {
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

  return { submitSupport };
}
