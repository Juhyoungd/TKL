"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RequireAuth } from "@/src/components/common/RequireAuth";
import { PostForm } from "@/src/components/post/PostForm";
import { useAppData } from "@/src/state/AppDataProvider";
import type { Post } from "@/src/types/findgoo";

// [글 수정]
export default function EditPostPage() {
  return (
    <RequireAuth>
      <EditPostForm />
    </RequireAuth>
  );
}

function EditPostForm() {
  const { id } = useParams<{ id: string }>();
  const appData = useAppData();
  const [post, setPost] = useState<Post | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    appData.getPost(id).then((result) => { if (!cancelled) setPost(result); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (post === undefined) return <div className="page"><p>불러오는 중…</p></div>;
  if (post === null) return <div className="page"><p>존재하지 않는 글이에요.</p></div>;
  if (!post.mine) {
    return (
      <div className="page">
        <Link className="page-back" href={`/post/${post.id}`}>← 뒤로</Link>
        <p>본인이 작성한 글만 수정할 수 있어요.</p>
      </div>
    );
  }

  return <PostForm editingPost={post} />;
}
