import { FindgooApp } from "@/src/components/FindgooApp";
import { getChatGPTUser } from "@/src/lib/auth/chatgpt-auth";
import type { InitialView } from "@/src/types/findgoo";

// [공통 앱 화면]
// 각 app 라우트는 이 화면에 최초 진입 위치만 전달합니다.
export async function FindgooScreen({ initialView }: { initialView: InitialView }) {
  const user = await getChatGPTUser();
  const initialUser = user
    ? { userId: user.userId, displayName: user.displayName, email: user.email }
    : null;
  return <FindgooApp initialUser={initialUser} initialView={initialView} />;
}
