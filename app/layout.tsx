import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "찾구 앱 베타 — 제안이 성사되면 열리는 1:1 거래 채팅",
  description: "구매글과 급구를 둘러보고 조건을 제안하세요. 거래가 성사되면 두 사람만의 채팅방이 열립니다.",
  applicationName: "찾구",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "찾구",
  },
  openGraph: {
    title: "찾구 앱 베타 — 제안부터 거래 채팅까지",
    description: "제안을 비교하고 거래가 성사되면 두 사람만의 1:1 채팅방이 열리는 리버스 마켓",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "찾구 앱 베타 — 제안부터 거래 채팅까지",
    description: "제안을 비교하고 거래가 성사되면 두 사람만의 1:1 채팅방이 열리는 리버스 마켓",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
