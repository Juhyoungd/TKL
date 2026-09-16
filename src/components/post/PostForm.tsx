"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { categories, regions } from "@/src/constants/feature-spec";
import { useAppData } from "@/src/state/AppDataProvider";
import { useAuth } from "@/src/state/AuthProvider";
import { useToast } from "@/src/state/ToastProvider";
import type { Post, PostType } from "@/src/types/findgoo";

type PostFormProps = {
  initialType?: PostType;
  editingPost?: Post | null;
};

// [구매글 작성] + [급구 작성] + [글 수정] — 하나의 폼으로 새 글 등록과 수정을 함께 처리합니다.
export function PostForm({ initialType = "buy", editingPost = null }: PostFormProps) {
  const router = useRouter();
  const appData = useAppData();
  const { profile } = useAuth();
  const { flash } = useToast();
  const [type, setType] = useState<PostType>(editingPost?.type ?? initialType);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = {
      type,
      category: String(form.get("category")),
      title: String(form.get("title")),
      description: String(form.get("description")),
      price: Number(form.get("price")),
      region: String(form.get("region")),
      deadline: String(form.get("deadline") ?? "") || undefined,
    };

    setSubmitting(true);
    if (editingPost) {
      const { error } = await appData.updatePost(editingPost.id, values);
      setSubmitting(false);
      if (error) { flash(error); return; }
      flash("글을 수정했어요.");
      router.push(`/post/${editingPost.id}`);
      return;
    }

    const authorName = profile?.nickname || profile?.name || "회원";
    const { post, error } = await appData.addPost(values, authorName);
    setSubmitting(false);
    if (error || !post) { flash(error ?? "글을 등록하지 못했어요."); return; }
    flash("글이 등록됐어요.");
    router.push(`/post/${post.id}`);
  }

  const backHref = editingPost ? `/post/${editingPost.id}` : type === "buy" ? "/buy" : "/urgent";

  return (
    <div className="page">
      <Link className="page-back" href={backHref}>← 뒤로</Link>
      <section className="page-card">
        <h1 className="page-title">{editingPost ? "글 수정" : type === "buy" ? "구매글 작성" : "급구 작성"}</h1>
        <form className="page-form" onSubmit={handleSubmit}>
          <div className="editor-type">
            <button type="button" className={type === "buy" ? "active" : ""} onClick={() => setType("buy")}>구매해요</button>
            <button type="button" className={type === "urgent" ? "urgent active" : ""} onClick={() => setType("urgent")}>급구</button>
          </div>
          <label><span>제목</span><input name="title" required maxLength={80} defaultValue={editingPost?.title} placeholder="무엇을 찾고 있나요?" /></label>
          <div className="two-fields">
            <label><span>카테고리</span><select name="category" defaultValue={editingPost?.category ?? (type === "urgent" ? "심부름" : "디지털")}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>동네</span><select name="region" defaultValue={editingPost?.region ?? profile?.region ?? regions[0]}>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <label><span>{type === "buy" ? "희망 가격" : "지원 금액"}</span><div className="price-input"><input name="price" type="number" min="1000" step="1000" required defaultValue={editingPost?.price} /><b>원</b></div></label>
          {type === "urgent" && <label><span>필요 시간</span><input name="deadline" defaultValue={editingPost?.deadline} placeholder="예: 오늘 18:00" /></label>}
          <label><span>상세 내용</span><textarea name="description" required minLength={10} maxLength={1200} defaultValue={editingPost?.description} placeholder="조건과 거래 방법을 구체적으로 적어주세요." /></label>
          <div className="safe-tip"><span>✓</span><p><strong>안전 거래 안내</strong>실제 연락처, 계좌번호, 민감한 개인정보는 입력하지 마세요.</p></div>
          <button className="form-submit" type="submit" disabled={submitting}>{submitting ? "저장 중…" : editingPost ? "수정 완료" : "글 등록하기"}</button>
        </form>
      </section>
    </div>
  );
}
