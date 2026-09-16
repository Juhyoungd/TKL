import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <Link className="findgoo-brand light" href="/"><span className="logo-stamp">찾</span><strong>찾구</strong></Link>
        <p>구매글과 급구를 올리고, 제안을 받아 안전하게 거래하세요.</p>
      </div>
      <div className="footer-links">
        <Link href="/terms">이용 안내</Link>
        <Link href="/support">고객센터</Link>
        <span>© 찾구</span>
      </div>
    </footer>
  );
}
