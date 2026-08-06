import { supportTickets } from "@/db/schema";
import { apiError, cleanText, getApiUser, nowIso, routeError } from "@/src/lib/api/route-helpers";
import { getDb } from "@/src/lib/database";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return apiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");
  try {
    const body = await request.json() as Record<string, unknown>;
    const subject = cleanText(body.subject, 80);
    const content = cleanText(body.body, 1200);
    if (!subject || content.length < 10) return apiError("제목과 10자 이상의 문의 내용을 입력해주세요.");
    await getDb().insert(supportTickets).values({ id: crypto.randomUUID(), userId: user.userId, email: user.email, subject, body: content, status: "received", createdAt: nowIso() });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
