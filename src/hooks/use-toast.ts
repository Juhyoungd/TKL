"use client";

import { useState } from "react";

// [알림 토스트] 화면 하단에 잠깐 보여줄 안내 메시지를 관리합니다.
export function useToast() {
  const [toast, setToast] = useState("");

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  }

  return { toast, flash };
}
