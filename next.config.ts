import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 상위 폴더(C:\Users\USER)에도 lockfile이 있어서 워크스페이스 루트를 명시합니다.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
