// import { getArticles } from "@/api/listing/getArticles";
// import { getColleges } from "@/api/listing/getColleges";
// import { getExams } from "@/api/listing/getExams";
import type { MetadataRoute } from "next";

const INVALID_CHARACTERS_REGEX = /[&<>\"']/;

// function isValidSlug(slug: string): boolean {
//   return !INVALID_CHARACTERS_REGEX.test(slug);
// }

// async function generateCollegesUrls(): Promise<MetadataRoute.Sitemap> {
//   const allColleges = await getColleges({
//     is_active: true,
//     limit: 4000,
//   });

//   return allColleges.colleges.map((college) => {
//     const baseSlug = `${college.slug.replace(/-\d+$/, "")}-${college.college_id}`;
//     if (!isValidSlug(baseSlug)) {
//       console.warn(`Excluded invalid college URL slug: ${baseSlug}`);
//       return [];
//     }
  
//     const baseUrl = `https://www.truescholar.in/colleges/${baseSlug}`;
//     return [
//       { url: baseUrl, changeFrequency: "weekly" as const, priority: 1 },
//       { url: `${baseUrl}/admission-process`, changeFrequency: "weekly" as const, priority: 0.8 },
//     ];
//   }).flat();
// }

// async function generateExamsUrls(): Promise<MetadataRoute.Sitemap> {
//   const allExams = (await getExams()) ?? { exams: [] };
  
//   if (!Array.isArray(allExams.exams)) {
//     console.error("getExams() did not return an array.");
//     return [];
//   }

//   return allExams.exams.map((exam) => {
//     const slug = `${exam.slug}-${exam.exam_id}`;
//     if (!isValidSlug(slug)) {
//       console.warn(`Excluded invalid exam URL slug: ${slug}`);
//       return [];
//     }

//     return { url: `https://www.truescholar.in/exams/${slug}`, changeFrequency: "weekly" as const, priority: 1 };
//   }).flat();
// }

// async function generateArticlesUrls(): Promise<MetadataRoute.Sitemap> {
//   const allArticles = (await getArticles()) ?? [];

//   if (!Array.isArray(allArticles)) {
//     console.error("getArticles() did not return an array.");
//     return [];
//   }

//   return allArticles.map((article) => {
//     const slug = `${article.slug}-${article.article_id}`;
//     if (!isValidSlug(slug)) {
//       console.warn(`Excluded invalid article URL slug: ${slug}`);
//       return [];
//     }

//     return { url: `https://www.truescholar.in/articles/${slug}`, changeFrequency: "daily" as const, priority: 1 };
//   }).flat();
// }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // const [examUrls, collegeUrls] = await Promise.all([
  //   generateExamsUrls(),
  //   generateCollegesUrls(),
  //   generateArticlesUrls(),
  // ]);

  return [
    {
      url: "https://www.truescholar.in",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://www.truescholar.in/colleges",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://www.truescholar.in/exams",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://www.truescholar.in/articles",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    // {
    //   url: "https://www.truescholar.in/about-us",
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
    {
      url: "https://www.truescholar.in/contact-us",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://www.truescholar.in/privacy-policy",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // {
    //   url: "https://www.truescholar.in/compare",
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.5,
    // },
    // ...examUrls,
    // ...collegeUrls,
    // ...articleUrls,
  ];
}