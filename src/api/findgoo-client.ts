type UploadPurpose = "profile" | "chat";

// [이미지 전송]
export async function uploadFindgooImage(file: File, purpose: UploadPurpose) {
  const form = new FormData();
  form.set("file", file);
  form.set("purpose", purpose);
  const response = await fetch("/api/uploads", { method: "POST", body: form });
  if (!response.ok) throw new Error("image upload failed");
  return (await response.json() as { url: string }).url;
}

// [1:1 문의]
export async function createSupportTicket(payload: { subject: string; body: string }) {
  const response = await fetch("/api/support", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("support request failed");
}
