import { getColleges } from "@/api/list/getColleges";
import { getExams } from "@/api/list/getExams";
import { getArticles } from "@/api/list/getArticles";

const INVALID_CHARACTERS_REGEX = /[&<>"']/;
function isValidSlug(slug: string): boolean {
  return !INVALID_CHARACTERS_REGEX.test(slug);
}

export async function generateCollegesUrls() {
  const allColleges = await getColleges({ limit: 5000, page: 1, filters: {} });
  return allColleges.colleges
    .map((college: { slug?: string; college_id: string | number }) => {
      if (!college.slug) return [];
      const baseSlug = `${college.slug.replace(/-\d+$/, "")}-${
        college.college_id
      }`;
      if (!isValidSlug(baseSlug)) return [];
      const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/colleges/${baseSlug}`;
      return [
        { url: baseUrl, changeFrequency: "weekly", priority: 1 },
        {
          url: `${baseUrl}/admission-process`,
          changeFrequency: "weekly",
          priority: 0.8,
        },
        {
          url: `${baseUrl}/cutoffs`,
          changeFrequency: "monthly",
          priority: 0.7,
        },
        {
          url: `${baseUrl}/scholarship`,
          changeFrequency: "monthly",
          priority: 0.7,
        },
        {
          url: `${baseUrl}/faq`,
          changeFrequency: "monthly",
          priority: 0.6,
        },
        {
          url: `${baseUrl}/fees`,
          changeFrequency: "monthly",
          priority: 0.6,
        },
        {
          url: `${baseUrl}/courses`,
          changeFrequency: "monthly",
          priority: 0.6,
        },
        {
          url: `${baseUrl}/placements`,
          changeFrequency: "monthly",
          priority: 0.6,
        },
        {
          url: `${baseUrl}/rankings`,
          changeFrequency: "monthly",
          priority: 0.6,
        },
      ];
    })
    .flat();
}

export async function generateExamsUrls() {
  const allExams = (await getExams({
    page: 1,
    pageSize: 50000,
    selectedFilters: {},
  })) ?? { exams: [] };
  if (!Array.isArray(allExams.exams)) return [];
  return allExams.exams
    .map((exam: { slug?: string; exam_id: string | number }) => {
      if (!exam.slug) return [];
      const slug = `${exam.slug}-${exam.exam_id}`;
      if (!isValidSlug(slug)) return [];
      const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/exams/${slug}`;
      return [
        { url: baseUrl, changeFrequency: "weekly", priority: 0.6 },
        {
          url: `${baseUrl}/content`,
          changeFrequency: "monthly",
          priority: 0.7,
        },
      ];
    })
    .flat();
}

export async function generateArticlesUrls() {
  const allArticlesResponse = (await getArticles(1, 4000)) ?? { data: [] };
  const allArticles = allArticlesResponse.data;
  if (!Array.isArray(allArticles)) return [];
  return allArticles
    .map((article: { slug?: string; article_id: string | number }) => {
      if (!article.slug) return [];
      const slug = `${article.slug}-${article.article_id}`;
      if (!isValidSlug(slug)) return [];
      const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/articles/${slug}`;
      return [{ url: baseUrl, changeFrequency: "daily", priority: 1 }];
    })
    .flat();
}
