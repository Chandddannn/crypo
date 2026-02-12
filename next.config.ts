import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXT_PUBLIC_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
  },
  async rewrites() {
    return [
      {
        source: "/api/coincap/assets",
        destination: "https://api.coincap.io/v2/assets",
      },
      {
        source: "/api/coincap/assets/:id",
        destination: "https://api.coincap.io/v2/assets/:id",
      },
      {
        source: "/api/coincap/assets/:id/history",
        destination: "https://api.coincap.io/v2/assets/:id/history",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coin-images.coingecko.com",
        pathname: "/coins/images/**",
      },
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
        pathname: "/coins/images/**",
      },
    ],
  },
};

export default nextConfig;
