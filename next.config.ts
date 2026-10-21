import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Tailwind v4 class-based dark mode reload trigger */
  cacheComponents: true,
  partialPrefetching: true,
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
