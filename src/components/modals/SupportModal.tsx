"use client";

import type { FormEvent } from "react";

type SupportModalProps = {
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

// [1:1 문의]
export function SupportModal({ onClose, onSubmit }: SupportModalProps) {
  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <section className="form-modal support-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header><button onClick={onClose}>×</button><strong>1:1 문의</strong><span></span></header>
        <form onSubmit={onSubmit}>
          <div className="support-guide"><span>?</span><p><strong>무엇을 도와드릴까요?</strong><small>오류, 거래 문제, 기능 제안을 자유롭게 적어주세요.</small></p></div>
          <label><span>문의 제목</span><input name="subject" required maxLength={80} placeholder="문의 내용을 요약해 주세요." /></label>
          <label><span>상세 내용</span><textarea name="body" required minLength={10} maxLength={1200} placeholder="확인이 필요한 내용을 10자 이상 적어 주세요." /></label>
          <button className="form-submit" type="submit">문의 접수</button>
        </form>
      </section>
    </div>
  );
}
