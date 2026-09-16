"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ToastContextValue = {
  toast: string;
  flash: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

// [알림 토스트] 어느 페이지에서 호출하든 같은 토스트 한 줄(AppShell)에 표시되도록 전역으로 관리합니다.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState("");

  const flash = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  }, []);

  const value = useMemo(() => ({ toast, flash }), [toast, flash]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast는 ToastProvider 안에서만 사용할 수 있어요.");
  return context;
}
