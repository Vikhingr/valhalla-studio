import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La página principal es el portafolio a lápiz (public/index.html)
  async rewrites() {
    return [{ source: "/", destination: "/index.html" }];
  },
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
