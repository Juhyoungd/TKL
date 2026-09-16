"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/src/lib/supabase/client";
import { translateSupabaseError } from "@/src/lib/supabase/auth-errors";

export type Profile = {
  id: string;
  name: string;
  phone: string | null;
  nickname: string;
  region: string;
  avatarUrl: string | null;
};

type ProfileRow = {
  id: string;
  name: string;
  phone: string | null;
  nickname: string | null;
  region: string | null;
  avatar_url: string | null;
};

type ProfileUpdateInput = { nickname?: string; avatarUrl?: string | null; region?: string };
type AuthResult = { error: string | null };

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (input: { email: string; password: string; name: string; nickname: string; phone: string }) => Promise<AuthResult>;
  updateProfile: (input: ProfileUpdateInput) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  deleteAccount: () => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    nickname: row.nickname || row.name || "회원",
    region: row.region || "지역 미설정",
    avatarUrl: row.avatar_url ?? null,
  };
}

// [회원 인증] Supabase Auth 세션 + profiles 테이블을 함께 들고 있는 전역 인증 상태.
// findgoo-app(모바일)의 AuthContext와 같은 Supabase 프로젝트/스키마를 사용합니다.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // Supabase가 설정되지 않은 경우는 정적으로 판단할 수 있어 초기값에서 바로 반영합니다.
  const [initializing, setInitializing] = useState(() => isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 세션이 바뀌면(특히 로그아웃) 이전 프로필이 잠깐이라도 보이지 않도록 렌더링 중에 바로 비웁니다.
  const sessionUserId = session?.user.id ?? null;
  const [profileSessionId, setProfileSessionId] = useState<string | null>(null);
  if (sessionUserId !== profileSessionId) {
    setProfileSessionId(sessionUserId);
    setProfile(null);
  }

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setProfile(data ? normalizeProfile(data as ProfileRow) : null);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  async function signIn(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) return { error: "Supabase 환경변수를 먼저 설정해주세요." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: translateSupabaseError(error) };
  }

  async function signUp(input: { email: string; password: string; name: string; nickname: string; phone: string }): Promise<AuthResult> {
    if (!isSupabaseConfigured) return { error: "Supabase 환경변수를 먼저 설정해주세요." };
    const { error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { name: input.name, nickname: input.nickname, phone: input.phone } },
    });
    return { error: translateSupabaseError(error) };
  }

  async function updateProfile(input: ProfileUpdateInput): Promise<AuthResult> {
    if (!profile || !session) return { error: "로그인이 필요해요." };
    const patch: Record<string, unknown> = {};
    if (input.nickname !== undefined) patch.nickname = input.nickname;
    if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl;
    if (input.region !== undefined) patch.region = input.region;
    if (Object.keys(patch).length === 0) return { error: null };

    const { error } = await supabase.from("profiles").update(patch).eq("id", session.user.id);
    if (error) return { error: translateSupabaseError(error) };
    setProfile((current) => (current ? { ...current, ...input } as Profile : current));
    return { error: null };
  }

  async function signOut() {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  }

  async function resetPassword(email: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) return { error: "Supabase 환경변수를 먼저 설정해주세요." };
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { error: translateSupabaseError(error) };
  }

  async function deleteAccount(): Promise<AuthResult> {
    if (!isSupabaseConfigured || !session) return { error: "로그인된 계정을 확인하지 못했어요." };
    const { error } = await supabase.functions.invoke("delete-account");
    if (error) return { error: translateSupabaseError(error) };
    await supabase.auth.signOut();
    setProfile(null);
    return { error: null };
  }

  const value = useMemo(
    () => ({ session, profile, initializing, signIn, signUp, updateProfile, signOut, resetPassword, deleteAccount }),
    [session, profile, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있어요.");
  return context;
}
