import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${base}/sitemap-static.xml</loc>\n  </sitemap>\n  <sitemap>\n    <loc>${base}/sitemap-colleges.xml</loc>\n  </sitemap>\n  <sitemap>\n    <loc>${base}/sitemap-exams.xml</loc>\n  </sitemap>\n  <sitemap>\n    <loc>${base}/sitemap-articles.xml</loc>\n  </sitemap>\n  <sitemap>\n    <loc>${base}/sitemap-authors.xml</loc>\n  </sitemap>\n</sitemapindex>`;
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
