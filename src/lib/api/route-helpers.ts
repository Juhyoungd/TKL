import { getChatGPTUser } from "@/src/lib/auth/chatgpt-auth";

export async function getApiUser() {
  return getChatGPTUser();
}

export function apiError(message: string, status = 400, code?: string) {
  return Response.json({ error: message, code }, { status });
}

export function nowIso() {
  return new Date().toISOString();
}

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function toPositiveInt(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

export function routeError(error: unknown) {
  const message = error instanceof Error ? error.message : "요청을 처리하지 못했습니다.";
  console.error(error);
  return apiError(message.includes("no such table") ? "서비스 데이터 준비 중입니다. 잠시 후 다시 시도해주세요." : "요청을 처리하지 못했습니다.", 500);
}
