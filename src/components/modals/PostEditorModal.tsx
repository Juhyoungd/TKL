"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { categories, regions } from "@/src/constants/feature-spec";
import type { Post, PostType } from "@/src/types/findgoo";

type EditorState = { open: boolean; post: Post | null; type: PostType };

type PostEditorModalProps = {
  editor: EditorState;
  setEditor: Dispatch<SetStateAction<EditorState>>;
  region: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

// [구매글 작성] + [급구 작성]
export function PostEditorModal({ editor, setEditor, region, onSubmit }: PostEditorModalProps) {
  return (
    <div className="modal-layer" onMouseDown={() => setEditor({ ...editor, open: false })}>
      <section className="form-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-handle"></div>
        <header>
          <button onClick={() => setEditor({ ...editor, open: false })}>×</button>
          <strong>{editor.post ? "글 수정" : editor.type === "buy" ? "구매글 작성" : "급구 작성"}</strong>
          <span></span>
        </header>
        <form onSubmit={onSubmit}>
          <div className="editor-type">
            <button type="button" className={editor.type === "buy" ? "active" : ""} onClick={() => setEditor({ ...editor, type: "buy" })}>구매해요</button>
            <button type="button" className={editor.type === "urgent" ? "urgent active" : ""} onClick={() => setEditor({ ...editor, type: "urgent" })}>급구</button>
          </div>
          <label><span>제목</span><input name="title" required maxLength={80} defaultValue={editor.post?.title} placeholder="무엇을 찾고 있나요?" /></label>
          <div className="two-fields">
            <label><span>카테고리</span><select name="category" defaultValue={editor.post?.category ?? (editor.type === "urgent" ? "심부름" : "디지털")}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>동네</span><select name="region" defaultValue={editor.post?.region ?? region}>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <label><span>{editor.type === "buy" ? "희망 가격" : "지원 금액"}</span><div className="price-input"><input name="price" type="number" min="1000" step="1000" required defaultValue={editor.post?.price} /><b>원</b></div></label>
          {editor.type === "urgent" && <label><span>필요 시간</span><input name="deadline" defaultValue={editor.post?.deadline} placeholder="예: 오늘 18:00" /></label>}
          <label><span>상세 내용</span><textarea name="description" required minLength={10} maxLength={1200} defaultValue={editor.post?.description} placeholder="조건과 거래 방법을 구체적으로 적어주세요." /></label>
          <div className="safe-tip"><span>✓</span><p><strong>베타 체험 안내</strong>실제 연락처, 계좌번호, 민감한 개인정보는 입력하지 마세요.</p></div>
          <button className="form-submit" type="submit">{editor.post ? "수정 완료" : "글 등록하기"}</button>
        </form>
      </section>
    </div>
  );
}
