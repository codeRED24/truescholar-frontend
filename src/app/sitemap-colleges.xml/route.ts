import { NextResponse } from "next/server";
import { generateCollegesUrls } from "../sitemap.utils";

export async function GET() {
  const urls = await generateCollegesUrls();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (u) =>
        `<url><loc>${u.url}</loc><changefreq>${u.changeFrequency}</changefreq><priority>${u.priority}</priority></url>`
    )
    .join("\n")}\n</urlset>`;
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
