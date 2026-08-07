import { uploadFindgooImage } from "@/src/api/findgoo-client";
import type { Viewer } from "@/src/types/findgoo";

type UploadPurpose = "profile" | "chat";

// [이미지 전송]
// 정식 회원은 서버 업로드를, 비회원 체험(guest-device)은 기기 안에서만 보이는
// data URL로 대체해 별도 로그인 없이도 사진 기능을 체험할 수 있게 합니다.
export async function resolveImageSource(file: File, purpose: UploadPurpose, viewer: Viewer) {
  if (viewer && viewer.userId !== "guest-device") {
    return uploadFindgooImage(file, purpose);
  }
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
