import { supabase } from "@/src/lib/supabase/client";

// [이미지 전송] Supabase Storage에 직접 업로드합니다(findgoo-app 모바일의 mediaService와 같은 버킷).
function safeExtension(file: File) {
  const candidate = file.name.split(".").pop()?.toLowerCase();
  if (candidate && /^[a-z0-9]{2,5}$/.test(candidate)) return candidate;
  return file.type === "image/png" ? "png" : "jpg";
}

export async function uploadAvatar(file: File, userId: string) {
  const path = `${userId}/avatar-${Date.now()}.${safeExtension(file)}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type || "image/jpeg", upsert: true });
  if (error) return { url: null, error: error.message };
  return { url: supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl, error: null };
}

export async function uploadChatImage(file: File, conversationId: string, userId: string) {
  const path = `${conversationId}/${userId}-${Date.now()}.${safeExtension(file)}`;
  const { error } = await supabase.storage.from("chat-media").upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) return { path: null, url: null, error: error.message };
  const { data, error: signedError } = await supabase.storage.from("chat-media").createSignedUrl(path, 60 * 60 * 24);
  return { path, url: data?.signedUrl ?? null, error: signedError?.message ?? null };
}

export async function signChatImage(path: string) {
  const { data, error } = await supabase.storage.from("chat-media").createSignedUrl(path, 60 * 60 * 24);
  return { url: data?.signedUrl ?? null, error: error?.message ?? null };
}
