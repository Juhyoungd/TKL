"use client";

import type { ReactNode } from "react";
import { AppDataProvider } from "@/src/state/AppDataProvider";
import { AuthProvider } from "@/src/state/AuthProvider";
import { LocalPreferencesProvider } from "@/src/state/LocalPreferencesProvider";
import { ToastProvider } from "@/src/state/ToastProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppDataProvider>
        <LocalPreferencesProvider>
          <ToastProvider>{children}</ToastProvider>
        </LocalPreferencesProvider>
      </AppDataProvider>
    </AuthProvider>
  );
}
