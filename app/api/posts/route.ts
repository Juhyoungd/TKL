import { and, desc, eq, like, or, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { offers, posts, profiles } from "@/db/schema";
import { apiError, cleanText, getApiUser, nowIso, routeError, toPositiveInt } from "@/src/lib/api/route-helpers";
import { getDb } from "@/src/lib/database";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const category = cleanText(url.searchParams.get("category"), 30);
    const region = cleanText(url.searchParams.get("region"), 40);
    const query = cleanText(url.searchParams.get("q"), 80);
    const conditions: SQL[] = [eq(posts.status, "open")];
    if (type === "buy" || type === "urgent") conditions.push(eq(posts.type, type));
    if (category && category !== "전체") conditions.push(eq(posts.category, category));
    if (region) conditions.push(like(posts.regionDong, `%${region}%`));
    if (query) conditions.push(or(like(posts.title, `%${query}%`), like(posts.description, `%${query}%`))!);

    const db = getDb();
    const rows = await db.select().from(posts).where(and(...conditions)).orderBy(desc(posts.createdAt)).limit(40);
    const counts = await db.select({ postId: offers.postId, count: sql<number>`count(*)` }).from(offers).where(eq(offers.status, "pending")).groupBy(offers.postId);
    const countMap = new Map(counts.map((item) => [item.postId, Number(item.count)]));
    return Response.json({ posts: rows.map((post) => ({ ...post, offerCount: countMap.get(post.id) ?? 0 })) });
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return apiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");

  try {
    const body = await request.json() as Record<string, unknown>;
    const db = getDb();
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
    if (!profile) return apiError("회원정보를 먼저 등록해주세요.", 403, "PROFILE_REQUIRED");

    const type: "buy" | "urgent" = body.type === "urgent" ? "urgent" : "buy";
    const category = cleanText(body.category, 30);
    const title = cleanText(body.title, 80);
    const description = cleanText(body.description, 1200);
    const regionDong = cleanText(body.regionDong, 40) || profile.regionDong;
    const deadline = cleanText(body.deadline, 40) || null;
    const desiredPrice = toPositiveInt(body.desiredPrice);
    if (!category || !title || description.length < 10 || !desiredPrice) return apiError("제목, 카테고리, 가격과 10자 이상의 설명을 입력해주세요.");

    const now = nowIso();
    const post = {
      id: crypto.randomUUID(), authorId: user.userId, authorName: profile.nickname, type, category,
      title, description, desiredPrice, regionDong, deadline, status: "open" as const,
      viewCount: 0, createdAt: now, updatedAt: now,
    };
    await db.insert(posts).values(post);
    return Response.json({ post: { ...post, offerCount: 0 } }, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
