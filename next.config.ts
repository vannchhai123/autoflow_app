import type { NextConfig } from "next";

const backendOrigin = (
  process.env.NEXT_PUBLIC_API_URL || "https://autoflow-api-f5c6.onrender.com"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const nextConfig: NextConfig = {
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
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${backendOrigin}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
