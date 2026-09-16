"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/state/ToastProvider";

// [1:1 문의]
export default function SupportPage() {
  const router = useRouter();
  const { flash } = useToast();
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    flash("1:1 문의를 접수했어요.");
    router.push("/");
  }

  return (
    <div className="page">
      <h1 className="page-title">1:1 문의</h1>
      <p className="page-subtitle">오류, 거래 문제, 기능 제안을 자유롭게 적어주세요.</p>
      <section className="page-card">
        <div className="support-guide"><span>?</span><p><strong>무엇을 도와드릴까요?</strong><small>확인 후 답변드릴게요.</small></p></div>
        <form className="page-form" onSubmit={handleSubmit}>
          <label><span>문의 제목</span><input name="subject" required maxLength={80} placeholder="문의 내용을 요약해 주세요." /></label>
          <label><span>상세 내용</span><textarea name="body" required minLength={10} maxLength={1200} placeholder="확인이 필요한 내용을 10자 이상 적어 주세요." /></label>
          <button className="form-submit" type="submit" disabled={submitting}>문의 접수</button>
        </form>
      </section>
    </div>
  );
}
