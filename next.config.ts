import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16でTurbopackがデフォルトになったため、空の設定を追加
  turbopack: {},
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
      'contents/**/*',
    ],
  },
  // 開発サーバーの安定性を向上
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    return config;
  },
};

export default nextConfig;
