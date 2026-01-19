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

  // SEO & Performance: Cache headers for static assets
  async headers() {
    return [
      {
        // Cache static assets for 1 year (immutable)
        source: "/:path*.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache JS/CSS bundles for 1 year (they have content hashes)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Security headers for all pages
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        // Sitemap and robots.txt - shorter cache
        source: "/(sitemap.xml|sitemap-:path*.xml|robots.txt)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  // Compression is handled by Next.js automatically
  compress: true,

  // Power optimizations
  poweredByHeader: false,

  // Strict mode for better React behavior
  reactStrictMode: true,
};

export default withBundleAnalyzer(nextConfig);
