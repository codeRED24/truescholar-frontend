import { NextResponse } from "next/server";
import { generateArticlesUrls, generateExamNewsUrls } from "../sitemap.utils";

export async function GET() {
  try {
    // Generate both regular articles and exam news articles
    const [articleUrls, examNewsUrls] = await Promise.all([
      generateArticlesUrls(),
      generateExamNewsUrls(),
    ]);

    // Combine all URLs
    const allUrls = [...examNewsUrls, ...articleUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls
      .map(
        (u) =>
          `<url><loc>${u.url}</loc><changefreq>${u.changeFrequency}</changefreq><priority>${u.priority}</priority></url>`
      )
      .join("\n")}\n</urlset>`;
    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("Error generating sitemap-articles.xml:", error);
    // Return an empty sitemap instead of failing
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;
    return new NextResponse(emptyXml, {
      headers: { "Content-Type": "application/xml" },
    });
  }
}
