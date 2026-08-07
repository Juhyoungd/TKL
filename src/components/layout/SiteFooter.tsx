"use client";

type SiteFooterProps = {
  onOpenTerms: () => void;
  onOpenSupport: () => void;
};

export function SiteFooter({ onOpenTerms, onOpenSupport }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="findgoo-brand light"><span className="logo-stamp">찾</span><strong>찾구</strong></div>
        <p>찾는 사람이 먼저 올리는 리버스 로컬 마켓 · 공개 베타</p>
      </div>
      <div className="footer-links">
        <button onClick={onOpenTerms}>이용 안내</button>
        <button onClick={onOpenSupport}>의견 보내기</button>
        <span>© 2026 FINDGOO</span>
      </div>
    </footer>
  );
}
