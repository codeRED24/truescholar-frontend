import { generateArticlesUrls } from "../../sitemap.utils";
import { humanize } from "inflection";
import { getColleges } from "@/api/list/getColleges";
import { getCourseSitemapData } from "@/api/sitemap/getCourseSitemapData";
import { getExamSitemapData } from "@/api/sitemap/getExamSitemapData";
import slugify from "slug";

type SitemapItem = {
  url: string;
  title: string;
  location?: string;
};

type ExamSitemapItem = {
  exam_id: number;
  slug: string;
  exam_name: string;
};

export type SitemapData = {
  static: SitemapItem[];
  courses: SitemapItem[];
  cities: SitemapItem[];
  states: SitemapItem[];
  streams: SitemapItem[];
  articles: SitemapItem[];
  exams: ExamSitemapItem[];
};

// Helper function to extract readable title from URL
function getTitleFromUrl(url: string, baseUrl: string): string {
  const path = url.replace(baseUrl, "");

  // Handle homepage
  if (path === "/" || path === "") {
    return "Home";
  }

  // Extract the last meaningful part of the path
  const segments = path.split("/").filter((s) => s);
  const lastSegment = segments[segments.length - 1];

  // Remove ID suffix if present (e.g., "-123")
  const withoutId = lastSegment.replace(/-\d+$/, "");

  // Convert slug to title case
  return withoutId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function getSiteMapData(): Promise<SitemapData> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Define static page titles
  const staticPageTitles: Record<string, string> = {
    "/": "Home",
    "/about-us": "About Us",
    "/contact-us": "Contact Us",
    "/articles": "Articles",
    "/exams": "Exams",
    "/compare": "Compare Colleges",
    "/privacy-policy": "Privacy Policy",
  };

  try {
    // Fetch all sitemap data in parallel
    const [examData, articleUrls, collegesData, courseData] = await Promise.all([
      getExamSitemapData(1, 20000, true),
      generateArticlesUrls(),
      getColleges({ page: 1, limit: 1 }),
      getCourseSitemapData(),
    ]);

    // Transform static URLs
    const staticItems: SitemapItem[] = Object.entries(staticPageTitles).map(
      ([path, title]) => ({
        url: path,
        title: title,
      })
    );

    // Transform article URLs
    const articleItems: SitemapItem[] = articleUrls.map((item) => {
      const itemUrl = item.url || "";
      const safeBaseUrl = baseUrl || "";
      const path = itemUrl.replace(safeBaseUrl, "");
      const rawTitle = getTitleFromUrl(itemUrl, safeBaseUrl);
      return {
        url: path,
        title: humanize(rawTitle.replace(/ /g, "_")),
      };
    });

    const cityItems: SitemapItem[] = (
      collegesData.filter_section?.city_filter || []
    )
      .filter((item) => item.city_slug && item.city_name)
      .map((item) => {
        // Clean the slug by removing common prefixes
        const cleanSlug = item.city_slug!
          .replace(/^colleges-in-/, "")
          .replace(/^in-/, "");

        return {
          url: `/colleges-city-${cleanSlug}`,
          title: item.city_name!,
        };
      });

    const stateItems: SitemapItem[] = (
      collegesData.filter_section?.state_filter || []
    )
      .filter((item) => item.state_slug && item.state_name)
      .map((item) => {
        // Clean the slug by removing common prefixes
        const cleanSlug = item.state_slug!
          .replace(/^colleges-in-/, "")
          .replace(/^in-/, "");

        return {
          url: `/colleges-state-${cleanSlug}`,
          title: item.state_name!,
        };
      });

    const streamItems: SitemapItem[] = (
      collegesData.filter_section?.stream_filter || []
    )
      .filter((item) => item.stream_slug && item.stream_name)
      .map((item) => {
        // Clean the slug by removing common prefixes
        const cleanSlug = item.stream_slug!
          .replace(/^colleges-in-/, "")
          .replace(/^in-/, "")
          .replace(/-colleges$/, "");

        return {
          url: `/colleges-stream-${cleanSlug}`,
          title: `${item.stream_name!} Colleges`,
        };
      });

    const courseItems: SitemapItem[] = ((courseData as any)?.result || []).map(
      (item: any) => {
        return {
          url: `/courses/${item.slug}`,
          title: item.course_name,
        };
      }
    );

    const examItems: ExamSitemapItem[] = examData.exams.map((exam: any) => ({
      exam_id: exam.exam_id,
      slug: exam.slug,
      // Use API-provided name when present; this matches previous behavior.
      exam_name:
        typeof exam.exam_name === "string" && exam.exam_name.trim().length > 0
          ? exam.exam_name
          : humanize(slugify(exam.slug || "")),
    }));

    articleItems.sort((a, b) => a.title.localeCompare(b.title));
    cityItems.sort((a, b) => a.title.localeCompare(b.title));
    stateItems.sort((a, b) => a.title.localeCompare(b.title));
    streamItems.sort((a, b) => a.title.localeCompare(b.title));
    courseItems.sort((a, b) => a.title.localeCompare(b.title));
    examItems.sort((a, b) => a.exam_name.localeCompare(b.exam_name));

    return {
      static: staticItems,
      courses: courseItems,
      cities: cityItems,
      states: stateItems,
      streams: streamItems,
      articles: articleItems,
      exams: examItems,
    };
  } catch (error) {
    console.error("Error fetching sitemap data:", error);
    return {
      static: [],
      courses: [],
      cities: [],
      states: [],
      streams: [],
      articles: [],
      exams: [],
    };
  }
}
