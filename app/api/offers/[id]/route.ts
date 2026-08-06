import { and, eq } from "drizzle-orm";
import { offers } from "@/db/schema";
import { apiError, getApiUser, nowIso, routeError } from "@/src/lib/api/route-helpers";
import { getDb } from "@/src/lib/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_: Request, context: RouteContext) {
  const user = await getApiUser();
  if (!user) return apiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");
  try {
    const { id } = await context.params;
    const db = getDb();
    const [offer] = await db.select().from(offers).where(and(eq(offers.id, id), eq(offers.proposerId, user.userId))).limit(1);
    if (!offer) return apiError("제안을 찾을 수 없습니다.", 404);
    if (offer.status !== "pending") return apiError("이미 처리된 제안입니다.", 409);
    await db.update(offers).set({ status: "canceled", updatedAt: nowIso() }).where(eq(offers.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    return routeError(error);
  }
}
