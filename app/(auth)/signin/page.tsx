import Link from "next/link";
import { chatGPTSignInPath, getChatGPTUser } from "@/src/lib/auth/chatgpt-auth";

export const dynamic = "force-dynamic";

// [로그인]
export default async function SignInPage() {
  const user = await getChatGPTUser();
  return <main className="auth-route"><section><span className="logo-stamp large">찾</span><small>FINDGOO ACCOUNT</small><h1>{user ? `${user.displayName}님` : "찾구 시작하기"}</h1><p>{user ? "현재 계정으로 연결되어 있어요." : "회원으로 동기화하거나 비회원으로 먼저 둘러볼 수 있어요."}</p>{user ? <Link href="/profile">마이페이지로 이동</Link> : <><a href={chatGPTSignInPath("/profile")}>ChatGPT로 계속</a><Link className="guest-link" href="/">비회원으로 둘러보기</Link></>}</section></main>;
}
