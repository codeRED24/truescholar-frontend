import { getExams } from "@/api/list/getExams";
import { getArticles } from "@/api/list/getArticles";
import { getCollegeSitemapData } from "@/api/sitemap/getCollegeSitemapData";
import { getExamSitemapData } from "@/api/sitemap/getExamSitemapData";
import { getAuthors } from "@/api/list/getAuthors";

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
          const baseSlug = `${college.slug.replace(/-\d+$/, "")}-${
            college.college_id
          }`;
          if (!isValidSlug(baseSlug)) return [];
          const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/colleges/${baseSlug}`;

          const collegeUrls = [];

          // Always include the base college URL (info tab)
          collegeUrls.push({
            url: baseUrl,
            changeFrequency: "weekly",
            priority: 1,
          });

          // Add URLs only for available tabs
          college.available_tabs.forEach((tab) => {
            if (tab === "info") return; // Already added base URL

            let priority = 0.6;
            let changeFrequency = "monthly";

            // Set different priorities and frequencies for different tabs
            if (tab === "admission-process") {
              priority = 0.8;
              changeFrequency = "weekly";
            } else if (tab === "cutoffs" || tab === "scholarship") {
              priority = 0.7;
            } else if (tab === "news") {
              priority = 1;
              changeFrequency = "daily";
            }

            collegeUrls.push({
              url: `${baseUrl}/${tab}`,
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
          `Reached end of data. Got ${collegesData.colleges.length} < ${limit}`
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
          const baseSlug = `${exam.slug.replace(/-\d+$/, "")}-${exam.exam_id}`;
          if (!isValidSlug(baseSlug)) return [];
          const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/exams/${baseSlug}`;

          const examUrls = [];

          // Always include the base exam URL (info/default page)
          examUrls.push({
            url: baseUrl,
            changeFrequency: "weekly",
            priority: 0.8,
          });

          // Add URLs only for available silos
          exam.available_silos.forEach((silo) => {
            if (silo === "info" || silo === "exam_info") return; // Already added base URL

            let priority = 0.6;
            let changeFrequency = "weekly";

            // Set different priorities and frequencies for different silos
            if (silo === "syllabus" || silo === "exam_pattern") {
              priority = 0.7;
              changeFrequency = "weekly";
            } else if (silo === "cutoff" || silo === "result") {
              priority = 0.8;
              changeFrequency = "weekly";
            } else if (silo === "news") {
              priority = 0.9;
              changeFrequency = "daily";
            } else if (silo === "admit_card") {
              priority = 0.7;
              changeFrequency = "weekly";
            }

            examUrls.push({
              url: `${baseUrl}/${silo.replace(/_/g, "-")}`,
              changeFrequency,
              priority,
            });
          });

          return examUrls;
        })
        .flat();

      allUrls.push(...urls);
      console.log(
        `Generated ${urls.length} URLs from page ${page}. Total so far: ${allUrls.length}`
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
          const slug = `${exam.slug}-${exam.exam_id}`;
          if (!isValidSlug(slug)) return [];
          const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/exams/${slug}`;
          return [{ url: baseUrl, changeFrequency: "weekly", priority: 0.6 }];
        })
        .flat();
    } catch (fallbackError) {
      console.error("Fallback exam URL generation also failed:", fallbackError);
      return [];
    }
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
        const slug = `${article.slug}-${article.article_id}`;
        if (!isValidSlug(slug)) return [];
        const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/articles/${slug}`;
        return [{ url: baseUrl, changeFrequency: "daily", priority: 1 }];
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

          const baseSlug = `${exam.slug.replace(/-\d+$/, "")}-${exam.exam_id}`;
          if (!isValidSlug(baseSlug)) return [];

          return exam.news_articles.map((newsArticle) => ({
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/exams/${baseSlug}/news/${newsArticle.slug}`,
            changeFrequency: "daily" as const,
            priority: 1,
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
