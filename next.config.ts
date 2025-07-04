import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d28xcrw70jd98d.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "*",
      },
    ],
    deviceSizes: [320, 480, 768, 1024, 1440],
    imageSizes: [16, 32, 64, 128, 256],
  },
};

export default withBundleAnalyzer(nextConfig);
