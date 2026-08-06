import { env } from "cloudflare:workers";
import { apiError, getApiUser, routeError } from "@/src/lib/api/route-helpers";

// [이미지 전송] 프로필·채팅 이미지는 R2에 저장하고 URL만 D1에 기록합니다.
export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return apiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");

  try {
    const form = await request.formData();
    const file = form.get("file");
    const purpose = form.get("purpose") === "profile" ? "profile" : "chat";
    if (!(file instanceof File) || !file.type.startsWith("image/")) return apiError("이미지 파일을 선택해주세요.");
    if (file.size > 5_000_000) return apiError("이미지는 5MB 이하만 업로드할 수 있습니다.");

    const extension = file.type.split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "jpg";
    const key = `${purpose}/${user.userId}/${crypto.randomUUID()}.${extension}`;
    await env.FILES.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { ownerId: user.userId, purpose } });
    return Response.json({ key, url: `/api/uploads?key=${encodeURIComponent(key)}` }, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}

// [이미지 전송] 채팅과 프로필에서 사용할 이미지를 안전한 응답 헤더로 제공합니다.
export async function GET(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get("key") ?? "";
    if (!/^(profile|chat)\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(key)) return apiError("잘못된 이미지 주소입니다.", 400);
    const object = await env.FILES.get(key);
    if (!object) return apiError("이미지를 찾을 수 없습니다.", 404);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("cache-control", "public, max-age=31536000, immutable");
    headers.set("x-content-type-options", "nosniff");
    return new Response(object.body, { headers });
  } catch (error) {
    return routeError(error);
  }
}
