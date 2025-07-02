import { notFound } from "next/navigation";

function replaceSitemapUrls(xmlString: string, oldUrl: string, newUrl: string): string {
    return xmlString.replace(new RegExp(oldUrl, 'g'), newUrl);
  }

export async function GET(req: Request, context: { params: Promise<{ sitemap: string }> }) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_UI_URL || "http://localhost:3000/";
      const { sitemap } = await context.params; 
  
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${API_URL}/sitemap/${sitemap}`);
      const xml = await response.text();
      console.log("xml", xml)
      if (response.status !== 200){
        return notFound();
      }
      return new Response(replaceSitemapUrls(xml, `${API_URL}/sitemap`, baseUrl), {
        headers: {
          "Content-Type": "application/xml",
        },
      });
    } catch {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }
  }
  