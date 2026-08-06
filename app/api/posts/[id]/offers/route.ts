import { and, eq } from "drizzle-orm";
import { offers, posts, profiles } from "@/db/schema";
import { apiError, cleanText, getApiUser, nowIso, routeError, toPositiveInt } from "@/src/lib/api/route-helpers";
import { getDb } from "@/src/lib/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) return apiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");
  try {
    const { id } = await context.params;
    const body = await request.json() as Record<string, unknown>;
    const proposedPrice = toPositiveInt(body.proposedPrice);
    const message = cleanText(body.message, 400);
    if (!proposedPrice || message.length < 5) return apiError("제안 가격과 5자 이상의 메시지를 입력해주세요.");

    const db = getDb();
    const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (!post || post.status !== "open") return apiError("제안할 수 없는 게시글입니다.", 409);
    if (post.authorId === user.userId) return apiError("내 게시글에는 제안할 수 없습니다.", 409);
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
    if (!profile) return apiError("회원정보를 먼저 등록해주세요.", 403, "PROFILE_REQUIRED");
    const [existing] = await db.select().from(offers).where(and(eq(offers.postId, id), eq(offers.proposerId, user.userId), eq(offers.status, "pending"))).limit(1);
    if (existing) return apiError("이미 진행 중인 제안이 있습니다.", 409);

    const now = nowIso();
    const offer = { id: crypto.randomUUID(), postId: id, proposerId: user.userId, proposerName: profile.nickname, proposedPrice, message, status: "pending" as const, createdAt: now, updatedAt: now };
    await db.insert(offers).values(offer);
    return Response.json({ offer }, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
