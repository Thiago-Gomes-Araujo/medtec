import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* Tailwind v4 class-based dark mode reload trigger */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    agentUpgrade: "security",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
