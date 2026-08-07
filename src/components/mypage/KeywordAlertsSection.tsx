"use client";

import type { FormEvent } from "react";

type KeywordAlertsSectionProps = {
  keywords: string[];
  onAddKeyword: (event: FormEvent<HTMLFormElement>) => void;
  onRemoveKeyword: (keyword: string) => void;
};

export function KeywordAlertsSection({ keywords, onAddKeyword, onRemoveKeyword }: KeywordAlertsSectionProps) {
  return (
    <section className="my-section">
      <div className="my-title"><div><small>KEYWORD ALERTS</small><h3>관심 키워드 알림</h3></div><span>최대 8개</span></div>
      <p className="section-help">구매글이나 급구에 등록한 단어가 올라오면 바로 알려드려요.</p>
      <form className="keyword-form" onSubmit={onAddKeyword}>
        <input name="keyword" maxLength={20} placeholder="예: 아이패드, 팝업, 촬영 보조" />
        <button type="submit">추가</button>
      </form>
      <div className="keyword-list">
        {keywords.map((keyword) => (
          <button key={keyword} onClick={() => onRemoveKeyword(keyword)}>#{keyword}<span>×</span></button>
        ))}
      </div>
    </section>
  );
}
