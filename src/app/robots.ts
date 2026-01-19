/**
 * Robots.txt Configuration
 * Dynamically generates robots.txt based on environment
 */

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Use environment variable for base URL, with fallback
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.truescholar.in";

  // Check if we're in production (truescholar.in domain)
  const isProduction =
    baseUrl.includes("truescholar.in") &&
    !baseUrl.includes("vercel.app") &&
    !baseUrl.includes("localhost");

  // Block indexing on non-production environments
  if (!isProduction) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  // Production robots.txt
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/private/",
          "/api/",
          "/signin",
          "/signup",
          "/otp",
          "/reset-password",
          "/forgot-password",
          "/_next/",
          "/chat",
        ],
      },
      // Specific rules for common bots
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/private/", "/api/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/private/", "/api/"],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-static.xml`,
      `${baseUrl}/sitemap-colleges.xml`,
      `${baseUrl}/sitemap-exams.xml`,
      `${baseUrl}/sitemap-articles.xml`,
      `${baseUrl}/sitemap-authors.xml`,
      `${baseUrl}/sitemap-cities.xml`,
      `${baseUrl}/sitemap-states.xml`,
    ],
    host: baseUrl,
  };
}
