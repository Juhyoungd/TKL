import { and, eq } from "drizzle-orm";
import { offers, posts } from "@/db/schema";
import { apiError, cleanText, getApiUser, nowIso, routeError, toPositiveInt } from "@/src/lib/api/route-helpers";
import { getDb } from "@/src/lib/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await getApiUser();
    const db = getDb();
    const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (!post) return apiError("게시글을 찾을 수 없습니다.", 404);
    await db.update(posts).set({ viewCount: post.viewCount + 1 }).where(eq(posts.id, id));

    let visibleOffers: typeof offers.$inferSelect[] = [];
    if (user?.userId === post.authorId) {
      visibleOffers = await db.select().from(offers).where(and(eq(offers.postId, id), eq(offers.status, "pending")));
    } else if (user) {
      visibleOffers = await db.select().from(offers).where(and(eq(offers.postId, id), eq(offers.proposerId, user.userId)));
    }
    return Response.json({ post: { ...post, viewCount: post.viewCount + 1 }, offers: visibleOffers });
  } catch (error) {
    return routeError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) return apiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");
  try {
    const { id } = await context.params;
    const body = await request.json() as Record<string, unknown>;
    const db = getDb();
    const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (!post) return apiError("게시글을 찾을 수 없습니다.", 404);
    if (post.authorId !== user.userId) return apiError("작성자만 수정할 수 있습니다.", 403);

    const title = cleanText(body.title, 80) || post.title;
    const description = cleanText(body.description, 1200) || post.description;
    const category = cleanText(body.category, 30) || post.category;
    const regionDong = cleanText(body.regionDong, 40) || post.regionDong;
    const deadline = cleanText(body.deadline, 40) || null;
    const desiredPrice = toPositiveInt(body.desiredPrice) || post.desiredPrice;
    const status = body.status === "reserved" || body.status === "closed" || body.status === "open" ? body.status : post.status;
    await db.update(posts).set({ title, description, category, regionDong, deadline, desiredPrice, status, updatedAt: nowIso() }).where(eq(posts.id, id));
    const [updated] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return Response.json({ post: updated });
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) return apiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");
  try {
    const { id } = await context.params;
    const db = getDb();
    const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (!post) return apiError("게시글을 찾을 수 없습니다.", 404);
    if (post.authorId !== user.userId) return apiError("작성자만 삭제할 수 있습니다.", 403);
    await db.delete(offers).where(eq(offers.postId, id));
    await db.delete(posts).where(eq(posts.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    return routeError(error);
  }
}
