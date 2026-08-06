import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("builds the Findgoo app shell", async () => {
  const [layout, page, worker] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/FindgooApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../dist/server/index.js", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /<html lang="ko">/i);
  assert.match(layout, /찾구 앱 베타/);
  assert.match(layout, /1:1 거래 채팅/);
  assert.match(layout, /manifest\.webmanifest/);
  assert.match(page, /찾는 사람이 먼저/);
  assert.ok(worker.length > 1000);
  assert.doesNotMatch(layout + page, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps app trade capabilities wired", async () => {
  const [hosting, migration, manifest, page] = await Promise.all([
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_tough_bucky.sql", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../src/components/FindgooApp.tsx", import.meta.url), "utf8"),
  ]);

  assert.equal(JSON.parse(hosting).d1, "DB");
  assert.match(migration, /CREATE TABLE `profiles`/);
  assert.match(migration, /CREATE TABLE `posts`/);
  assert.match(migration, /CREATE TABLE `offers`/);
  assert.equal(JSON.parse(manifest).display, "standalone");
  assert.match(page, /판매 제안 보내기/);
  assert.match(page, /수락하고 거래/);
  assert.match(page, /거래가 성사된 뒤에만 채팅/);
  assert.match(page, /1:1 거래 채팅/);
  assert.match(page, /마이 찾구/);
  assert.match(page, /찜한 급구/);
  assert.match(page, /관심 키워드 알림/);
  assert.match(page, /Notification\.requestPermission/);
  assert.doesNotMatch(page, /먼저 써보고/);
});

test("keeps app-first notification and navigation behavior", async () => {
  const [page, styles, serviceWorker, personalHubMigration] = await Promise.all([
    readFile(new URL("../src/components/FindgooApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/sw.js", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_app_personal_hub.sql", import.meta.url), "utf8"),
  ]);

  assert.match(page, /최근 채팅/);
  assert.match(page, /거주 및 활동 지역/);
  assert.match(page, /색상 변경/);
  assert.match(styles, /min-height:44px/);
  assert.match(styles, /safe-area-inset-bottom/);
  assert.match(page, /aria-label="주요 메뉴"/);
  assert.match(page, /activeNav === "chat"/);
  assert.match(styles, /\.mobile-nav button:active/);
  assert.match(styles, /border-radius:25px!important/);
  assert.match(serviceWorker, /addEventListener\("push"/);
  assert.match(serviceWorker, /addEventListener\("notificationclick"/);
  assert.match(personalHubMigration, /CREATE TABLE `saved_posts`/);
  assert.match(personalHubMigration, /CREATE TABLE `push_subscriptions`/);
  assert.match(personalHubMigration, /CREATE TABLE `chat_messages`/);
});

test("keeps the full feature specification modular and searchable", async () => {
  const [spec, app, structure, schema, migration, uploadRoute, hosting] = await Promise.all([
    readFile(new URL("../src/constants/feature-spec.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/FindgooApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../FINDGOO_STRUCTURE.md", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0002_full_feature_framework.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/uploads/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);

  for (const label of ["회원", "구매글", "판매 제안", "채팅", "거래", "급구", "찜", "검색", "알림", "고객센터", "관리자", "마이페이지"]) {
    assert.match(spec, new RegExp(`\\[${label.replace(" ", "\\s")}\\]`));
  }
  assert.ok((spec.match(/type:\s*"(?:buy|urgent)"/g) ?? []).length >= 24);
  assert.match(app, /\[판매 제안 관리\]/);
  assert.match(app, /\[이미지 전송\]/);
  assert.match(structure, /기능별 수정 위치/);
  assert.match(schema, /export const transactions/);
  assert.match(schema, /export const reviews/);
  assert.match(schema, /export const reports/);
  assert.match(migration, /CREATE TABLE `social_accounts`/);
  assert.match(uploadRoute, /env\.FILES\.put/);
  assert.equal(JSON.parse(hosting).r2, "FILES");
});

test("offers five persistent app color themes", async () => {
  const [themes, app, styles, structure] = await Promise.all([
    readFile(new URL("../src/theme/palettes.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/FindgooApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../FINDGOO_STRUCTURE.md", import.meta.url), "utf8"),
  ]);

  for (const theme of ["dusk", "warm", "ocean", "forest", "berry"]) {
    assert.match(themes, new RegExp(`id: "${theme}"`));
    assert.match(styles, new RegExp(`theme-${theme}`));
  }
  assert.match(app, /theme-picker/);
  assert.match(app, /writeDeviceState\(storageKeys\.theme, theme\)/);
  assert.match(structure, /src\/theme/);
});

test("keeps the requested app and src architecture", async () => {
  const files = await Promise.all([
    "../app/(auth)/signin/page.tsx",
    "../app/(tabs)/page.tsx",
    "../app/buy/page.tsx",
    "../app/urgent/page.tsx",
    "../app/chat/page.tsx",
    "../app/profile/page.tsx",
    "../src/api/findgoo-client.ts",
    "../src/components/FindgooApp.tsx",
    "../src/hooks/use-install-prompt.ts",
    "../src/services/device-storage.ts",
    "../src/store/app-store.ts",
    "../src/types/findgoo.ts",
    "../src/utils/format.ts",
    "../src/constants/feature-spec.ts",
    "../src/lib/database.ts",
    "../src/theme/palettes.ts",
    "../src/assets/app-icons.ts",
  ].map((path) => readFile(new URL(path, import.meta.url), "utf8")));

  assert.equal(files.length, 17);
  assert.match(files[2], /initialView="buy"/);
  assert.match(files[3], /initialView="urgent"/);
  assert.match(files[4], /initialView="chat"/);
  assert.match(files[5], /initialView="profile"/);
});
