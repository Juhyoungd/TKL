import { eq } from "drizzle-orm";
import { profiles } from "@/db/schema";
import { apiError, cleanText, getApiUser, nowIso, routeError } from "@/src/lib/api/route-helpers";
import { getDb } from "@/src/lib/database";

export async function GET() {
  const user = await getApiUser();
  if (!user) return apiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");

  try {
    const [profile] = await getDb().select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
    return profile ? Response.json({ profile: { ...profile, categories: JSON.parse(profile.categories), activityRegions: JSON.parse(profile.activityRegions), keywords: JSON.parse(profile.keywords) } }) : apiError("회원정보를 등록해주세요.", 404, "PROFILE_REQUIRED");
  } catch (error) {
    return routeError(error);
  }
}

export async function PUT(request: Request) {
  const user = await getApiUser();
  if (!user) return apiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");

  try {
    const body = await request.json() as Record<string, unknown>;
    const nickname = cleanText(body.nickname, 20);
    const regionDong = cleanText(body.regionDong, 40);
    const avatarUrl = cleanText(body.avatarUrl, 500);
    const categories = Array.isArray(body.categories)
      ? body.categories.filter((item): item is string => typeof item === "string").slice(0, 8)
      : [];
    const activityRegions = Array.isArray(body.activityRegions)
      ? body.activityRegions.filter((item): item is string => typeof item === "string").map((item) => cleanText(item, 40)).filter(Boolean).slice(0, 3)
      : [regionDong];
    const keywords = Array.isArray(body.keywords)
      ? body.keywords.filter((item): item is string => typeof item === "string").map((item) => cleanText(item, 20)).filter((item) => item.length >= 2).slice(0, 8)
      : [];
    const pushEnabled = body.pushEnabled === true;
    if (nickname.length < 2) return apiError("닉네임은 2자 이상 입력해주세요.");
    if (regionDong.length < 2) return apiError("활동할 동네를 입력해주세요.");

    const db = getDb();
    const [existing] = await db.select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
    if (!existing && body.termsAccepted !== true) return apiError("이용약관에 동의해주세요.");

    const now = nowIso();
    await db.insert(profiles).values({
      userId: user.userId,
      email: user.email,
      nickname,
      avatarUrl,
      regionDong,
      activityRegions: JSON.stringify(activityRegions),
      categories: JSON.stringify(categories),
      keywords: JSON.stringify(keywords),
      pushEnabled,
      termsAcceptedAt: existing?.termsAcceptedAt ?? now,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: profiles.userId,
      set: { email: user.email, nickname, avatarUrl, regionDong, activityRegions: JSON.stringify(activityRegions), categories: JSON.stringify(categories), keywords: JSON.stringify(keywords), pushEnabled, updatedAt: now },
    });

    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
    return Response.json({ profile: { ...profile, categories: JSON.parse(profile.categories), activityRegions: JSON.parse(profile.activityRegions), keywords: JSON.parse(profile.keywords) } });
  } catch (error) {
    return routeError(error);
  }
}
