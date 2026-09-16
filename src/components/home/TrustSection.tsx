export function TrustSection() {
  return (
    <section className="trust-section">
      <div>
        <span className="section-label invert">TRUST</span>
        <h2>매너 신뢰도로<br />안심하고 거래하세요</h2>
        <p>거래 완료, 후기, 신고 이력을 바탕으로 매너 신뢰도가 쌓여요. 프로필에서 상대의 신뢰도를 미리 확인할 수 있어요.</p>
      </div>
      <div className="trust-card-sample">
        <div className="sample-user"><span>찾</span><div><strong>찾구 회원</strong><small>예시 프로필</small></div><b>거래 32회</b></div>
        <div className="sample-stats">
          <span><b>92.4</b><small>매너 신뢰도</small></span>
          <span><b>32</b><small>완료 거래</small></span>
          <span><b>4</b><small>좋은 후기</small></span>
        </div>
        <div className="sample-bar"><span /></div>
      </div>
    </section>
  );
}
