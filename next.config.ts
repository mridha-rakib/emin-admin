import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  experimental: {
    // Turbopack's on-disk dev cache in Next 16.1.x panics on this Windows setup with "Access is denied (os error 5)".
    turbopackFileSystemCacheForDev: false,
  },
  images: {
    // Listing images come from S3 or from any link a seller pastes, so the admin panel shows them as-is
    // instead of routing every host through the Next.js optimizer allow-list.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
