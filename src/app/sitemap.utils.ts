import { getExams } from "@/api/list/getExams";
import { getColleges } from "@/api/list/getColleges";
import { getArticles } from "@/api/list/getArticles";
import { getCollegeSitemapData } from "@/api/sitemap/getCollegeSitemapData";
import { getExamSitemapData } from "@/api/sitemap/getExamSitemapData";
import { getAuthors } from "@/api/list/getAuthors";
import { mapCollegeTabSlugToPath } from "@/lib/collegeTab";
import { mapExamSiloToPath } from "@/lib/examTab";
import { buildCollegeUrl, buildExamUrl, buildArticleUrl } from "@/lib/seo";

const INVALID_CHARACTERS_REGEX = /[&<>"']/;
function isValidSlug(slug: string): boolean {
  return !INVALID_CHARACTERS_REGEX.test(slug);
}

export async function generateCollegesUrls() {
  try {
    const allUrls = [];
    let page = 1;
    const limit = 1000; // Process in reasonable batches

    while (true) {
      // console.log(`Fetching colleges page ${page} with limit ${limit}...`);
      const collegesData = await getCollegeSitemapData(page, limit);

      if (!collegesData.colleges || collegesData.colleges.length === 0) {
        // console.log(`No more colleges found. Stopping at page ${page}`);
        break;
      }

      // console.log(
      //   `Processing ${collegesData.colleges.length} colleges from page ${page}`
      // );

      const urls = collegesData.colleges
        .map((college) => {
          if (!college.slug) return [];
          const relativeUrl = buildCollegeUrl(college.slug, college.college_id);
          if (!isValidSlug(relativeUrl)) return [];
          const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${relativeUrl}`;

          const collegeUrls = [];

          // Always include the base college URL (info tab)
          collegeUrls.push({
            url: baseUrl,
            changeFrequency: "monthly",
            priority: 0.8,
          });

          // Add URLs only for available tabs
          college.available_tabs.forEach((tab) => {
            if (tab === "info") return; // Already added base URL

            // Map backend tab name to frontend route path
            const tabPath = mapCollegeTabSlugToPath(tab);

            // Skip if it maps to empty string (info tab)
            if (tabPath === "") return;

            let priority = 0.6;
            let changeFrequency = "monthly";

            // Set different priorities and frequencies for different tabs
            // Use the mapped path for comparisons
            if (tabPath === "/admission-process") {
              priority = 0.8;
              changeFrequency = "weekly";
            } else if (tabPath === "/cutoffs" || tabPath === "/scholarship") {
              priority = 0.7;
            } else if (tabPath === "/news") {
              priority = 0.7;
              changeFrequency = "weekly";
            }

            collegeUrls.push({
              url: `${baseUrl}${tabPath}`,
              changeFrequency,
              priority,
            });
          });

          return collegeUrls;
        })
        .flat();

      allUrls.push(...urls);
      // console.log(
      //   `Generated ${urls.length} URLs from page ${page}. Total so far: ${allUrls.length}`
      // );

      // If we got fewer results than the limit, we've reached the end
      if (collegesData.colleges.length < limit) {
        console.log(
          `Reached end of data. Got ${collegesData.colleges.length} < ${limit}`,
        );
        break;
      }

      page++;

      // Safety check to prevent infinite loops
      if (page > 100) {
        console.log("Safety break: Too many pages, stopping");
        break;
      }
    }

    console.log(`Total URLs generated: ${allUrls.length}`);
    return allUrls;
  } catch (error) {
    console.error("Error generating college URLs for sitemap:", error);
    // Return empty array to prevent build failure
    return [];
  }
}

export async function generateExamsUrls() {
  try {
    const allUrls = [];
    let page = 1;
    const limit = 1000; // Process in reasonable batches

    while (true) {
      console.log(`Fetching exams page ${page} with limit ${limit}...`);
      const examsData = await getExamSitemapData(page, limit);

      if (!examsData.exams || examsData.exams.length === 0) {
        break;
      }

      const urls = examsData.exams
        .map((exam) => {
          if (!exam.slug) return [];
          const relativeUrl = buildExamUrl(exam.slug, exam.exam_id);
          if (!isValidSlug(relativeUrl)) return [];
          const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${relativeUrl}`;

          const examUrls: {
            url: string;
            changeFrequency: string;
            priority: number;
          }[] = [];

          // Always include the base exam URL (info/default page)
          examUrls.push({
            url: baseUrl,
            changeFrequency: "weekly",
            priority: 0.8,
          });

          // Add URLs only for available silos using centralized mapping
          exam.available_silos.forEach((silo) => {
            if (!silo) return;

            // Map backend silo to frontend path
            const pathSegment = mapExamSiloToPath(silo);

            // Empty mapping => base/info page already covered
            if (pathSegment === "") return;

            let priority = 0.6;
            let changeFrequency = "weekly";

            // Set different priorities and frequencies based on mapped path
            switch (pathSegment) {
              case "/exam-syllabus":
              case "/exam-pattern":
                priority = 0.7;
                changeFrequency = "weekly";
                break;
              case "/exam-cutoff":
              case "/exam-result":
                priority = 0.8;
                changeFrequency = "weekly";
                break;
              case "/news":
                priority = 0.9;
                changeFrequency = "weekly";
                break;
              case "/admit-card":
                priority = 0.7;
                changeFrequency = "weekly";
                break;
              default:
                // keep defaults for other mapped silos
                break;
            }

            examUrls.push({
              url: `${baseUrl}${pathSegment}`,
              changeFrequency,
              priority,
            });
          });

          return examUrls;
        })
        .flat();

      allUrls.push(...urls);
      console.log(
        `Generated ${urls.length} URLs from page ${page}. Total so far: ${allUrls.length}`,
      );

      // If we got fewer results than the limit, we've reached the end
      if (examsData.exams.length < limit) {
        break;
      }

      page++;

      // Safety check to prevent infinite loops
      if (page > 100) {
        console.log("Safety break: Too many pages, stopping");
        break;
      }
    }
    console.log(`Total exam URLs generated: ${allUrls.length}`);
    return allUrls;
  } catch (error) {
    console.error("Error generating exam URLs for sitemap:", error);
    // Fallback to the old method if the new API is not available
    try {
      console.log("Falling back to old exam URL generation method...");
      const allExams = (await getExams({
        page: 1,
        pageSize: 50000,
        selectedFilters: {},
      })) ?? { exams: [] };
      if (!Array.isArray(allExams.exams)) return [];

      console.log("exam page count: ", allExams.exams.length);

      return allExams.exams
        .map((exam: { slug?: string; exam_id: string | number }) => {
          if (!exam.slug) return [];
          const relativeUrl = buildExamUrl(exam.slug, exam.exam_id);
          if (!isValidSlug(relativeUrl)) return [];
          const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${relativeUrl}`;
          return [{ url: baseUrl, changeFrequency: "weekly", priority: 0.6 }];
        })
        .flat();
    } catch (fallbackError) {
      console.error("Fallback exam URL generation also failed:", fallbackError);
      return [];
    }
  }
}

export async function generateCitiesUrls() {
  try {
    // Fetch filter data (1 college is enough to get the filter section)
    const collegesData = await getColleges({ page: 1, limit: 1 });
    const cities = collegesData.filter_section?.city_filter || [];

    return cities
      .filter((city) => city.city_slug && city.city_name)
      .map((city) => {
        // Clean the slug logic
        const cleanSlug = city
          .city_slug!.replace(/^colleges-in-/, "")
          .replace(/^in-/, "");

        return {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/colleges-city-${cleanSlug}`,
          changeFrequency: "monthly" as const,
          priority: 0.8,
        };
      });
  } catch (error) {
    console.error("Error generating city URLs for sitemap:", error);
    return [];
  }
}

export async function generateArticlesUrls() {
  try {
    const allArticlesResponse = (await getArticles(1, 4000)) ?? { data: [] };
    const allArticles = allArticlesResponse.data;
    if (!Array.isArray(allArticles)) return [];

    console.log("article page count: ", allArticles.length);

    return allArticles
      .map((article: { slug?: string; article_id: string | number }) => {
        if (!article.slug) return [];
        const relativeUrl = buildArticleUrl(article.slug, article.article_id);
        if (!isValidSlug(relativeUrl)) return [];
        const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${relativeUrl}`;
        return [{ url: baseUrl, changeFrequency: "monthly", priority: 0.8 }];
      })
      .flat();
  } catch (error) {
    console.error("Error generating article URLs for sitemap:", error);
    // Return empty array to prevent build failure
    return [];
  }
}

export async function generateExamNewsUrls() {
  try {
    const allUrls = [];
    let page = 1;
    const limit = 1000;

    while (true) {
      const examsData = await getExamSitemapData(page, limit);

      if (!examsData.exams || examsData.exams.length === 0) {
        break;
      }

      const newsUrls = examsData.exams
        .map((exam) => {
          if (
            !exam.slug ||
            !exam.news_articles ||
            exam.news_articles.length === 0
          ) {
            return [];
          }

          const relativeUrl = buildExamUrl(exam.slug, exam.exam_id);
          if (!isValidSlug(relativeUrl)) return [];

          return exam.news_articles.map((newsArticle) => ({
            url: `${process.env.NEXT_PUBLIC_BASE_URL}${relativeUrl}/news/${newsArticle.slug}`,
            changeFrequency: "monthly" as const,
            priority: 0.9,
          }));
        })
        .flat();

      allUrls.push(...newsUrls);

      if (examsData.exams.length < limit) {
        break;
      }

      page++;

      if (page > 100) {
        console.log("Safety break: Too many pages, stopping");
        break;
      }
    }

    console.log(`Total exam news URLs generated: ${allUrls.length}`);
    return allUrls;
  } catch (error) {
    console.error("Error generating exam news URLs for sitemap:", error);
    return [];
  }
}

export async function generateAuthorsUrls() {
  try {
    const allAuthors = await getAuthors();
    if (!Array.isArray(allAuthors)) return [];

    console.log("author page count: ", allAuthors.length);

    return allAuthors
      .filter((author) => author.is_active) // Only include active authors
      .map((author) => {
        // Build slug from view_name or author_name
        const raw = (
          author.view_name ||
          author.author_name ||
          "author"
        ).toString();
        // Ensure no duplicate trailing id exists, then append the numeric id
        const baseSlug = `${raw.trim().replace(/-\d+$/, "").toLowerCase()}-${
          author.author_id
        }`;
        if (!isValidSlug(baseSlug)) return null;
        const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/authors/${baseSlug}`;
        return {
          url: baseUrl,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        };
      })
      .filter(Boolean) as {
      url: string;
      changeFrequency: string;
      priority: number;
    }[];
  } catch (error) {
    console.error("Error generating author URLs for sitemap:", error);
    // Return empty array to prevent build failure
    return [];
  }
}

export async function generateStatesUrls() {
  try {
    // Fetch filter data (1 college is enough to get the filter section)
    const collegesData = await getColleges({ page: 1, limit: 1 });
    const states = collegesData.filter_section?.state_filter || [];

    return states
      .filter((state) => state.state_slug && state.state_name)
      .map((state) => {
        // Clean the slug logic
        const cleanSlug = state
          .state_slug!.replace(/^colleges-in-/, "")
          .replace(/^in-/, "");

        return {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/colleges-state-${cleanSlug}`,
          changeFrequency: "monthly" as const,
          priority: 0.8,
        };
      });
  } catch (error) {
    console.error("Error generating state URLs for sitemap:", error);
    return [];
  }
}

export async function generateStreamsUrls() {
  try {
    const collegesData = await getColleges({ page: 1, limit: 1 });
    const streams = collegesData.filter_section?.stream_filter || [];

    return streams
      .filter((stream) => stream.stream_slug && stream.stream_name)
      .map((stream) => {
        const cleanSlug = stream
          .stream_slug!.replace(/^colleges-in-/, "")
          .replace(/^in-/, "")
          .replace(/-colleges$/, "");

        return {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/colleges-stream-${cleanSlug}`,
          changeFrequency: "monthly" as const,
          priority: 0.9,
        };
      });
  } catch (error) {
    console.error("Error generating stream URLs for sitemap:", error);
    return [];
  }
}
