import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// [서버 컴포넌트/라우트 핸들러] 쿠키에 담긴 세션으로 Supabase에 접속합니다.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl || "http://127.0.0.1:54321", supabaseAnonKey || "findgoo-local-anon-key", {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options ?? {});
          }
        } catch {
          // Server Component에서 호출되면 쓰기가 무시됩니다. middleware가 세션을 갱신하므로 괜찮습니다.
        }
      },
    },
  });
}
