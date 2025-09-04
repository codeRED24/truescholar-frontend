import { NextResponse } from "next/server";

export async function GET() {
  const base = "https://www.truescholar.in";
  const staticRoutes = [
    { path: "", priority: 1.0, changefreq: "daily" },
    { path: "about-us", priority: 0.7, changefreq: "monthly" },
    { path: "contact-us", priority: 0.6, changefreq: "monthly" },
    { path: "privacy-policy", priority: 0.5, changefreq: "yearly" },
    { path: "terms-and-conditions", priority: 0.5, changefreq: "yearly" },
    { path: "exams", priority: 0.8, changefreq: "weekly" },
    { path: "colleges", priority: 0.8, changefreq: "weekly" },
    { path: "articles", priority: 0.8, changefreq: "weekly" },
    { path: "compare-colleges", priority: 0.8, changefreq: "monthly" },
    { path: "signup", priority: 0.2, changefreq: "yearly" },
    { path: "signin", priority: 0.2, changefreq: "yearly" },
    { path: "chat", priority: 0.2, changefreq: "monthly" },
  ];
  const urls = staticRoutes
    .map(
      ({ path, priority, changefreq }) =>
        `<url>\n  <loc>${base}/${path}</loc>\n  <changefreq>${changefreq}</changefreq>\n  <priority>${priority}</priority>\n</url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
