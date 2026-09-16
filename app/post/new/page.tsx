"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RequireAuth } from "@/src/components/common/RequireAuth";
import { PostForm } from "@/src/components/post/PostForm";
import type { PostType } from "@/src/types/findgoo";

// [구매글 작성] + [급구 작성]
export default function NewPostPage() {
  return (
    <Suspense fallback={<div className="page"><p>불러오는 중…</p></div>}>
      <NewPostForm />
    </Suspense>
  );
}

function NewPostForm() {
  const searchParams = useSearchParams();
  const initialType: PostType = searchParams.get("type") === "urgent" ? "urgent" : "buy";

  return (
    <RequireAuth>
      <PostForm initialType={initialType} />
    </RequireAuth>
  );
}
