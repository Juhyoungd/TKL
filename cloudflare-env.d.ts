interface CloudflareEnv {
  DB: D1Database;
  FILES: R2Bucket;
  ASSETS: Fetcher;
}

declare namespace Cloudflare {
  interface Env extends CloudflareEnv {}
}
