import { getNewsByExamId } from "@/api/individual/getNewsByExamId";
import { getExamsById } from "@/api/individual/getExamsById";
import ExamHead from "@/components/page/exam/ExamHead";
import ExamNav from "@/components/page/exam/ExamNav";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { sanitizeHtml } from "@/components/utils/sanitizeHtml";
import TocGenerator from "@/components/miscellaneous/TocGenerator";
import "@/app/styles/tables.css";
import { Metadata } from "next";
import {
  siteConfig,
  buildCanonicalUrl,
  JsonLd,
  buildExamNewsBreadcrumbTrail,
  buildBreadcrumbSchema,
  buildNewsArticleSchema,
} from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo";

export const revalidate = 43200; // 12 hours

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "slug-id": string; "news-slug": string }>;
}): Promise<Metadata> {
  const { "slug-id": slugId, "news-slug": newsSlugId } = await params;

  const examMatch = slugId.match(/(.+)-(\d+)$/);
  if (!examMatch) return { title: "Exam Not Found | TrueScholar" };
  const examId = Number(examMatch[2]);
  if (isNaN(examId)) return { title: "Invalid Exam | TrueScholar" };

  const newsMatch = newsSlugId.match(/(.+)-(\d+)$/);
  if (!newsMatch) return { title: "News Not Found | TrueScholar" };
  const newsId = Number(newsMatch[2]);
  if (isNaN(newsId)) return { title: "Invalid News | TrueScholar" };

  // Nav data should come from the `getExamsById` endpoint (silo: exam_info)
  const navExam = await getExamsById(examId, "exam_info");
  // Fetch the actual news content using the existing endpoint
  const exam = await getNewsByExamId(newsId);
  if (!exam?.news_section?.[0]) {
    return { title: "News Not Found | TrueScholar" };
  }

  const { title, description, updated_at, meta_desc } = exam.news_section[0];

  const examName = exam.examInformation?.exam_name || "Unknown Exam";
  const examSlug =
    exam.examInformation?.slug?.replace(/-\d+$/, "") ||
    examName.toLowerCase().replace(/\s+/g, "-");
  const correctSlugId = `${examSlug}-${examId}`;
  const newsSlug = newsSlugId.replace(/-\d+$/, "");
  const canonicalPath = `/exams/${correctSlugId}/news/${newsSlug}-${newsId}`;

  return {
    title: `${title} | ${examName} News | TrueScholar`,
    description: meta_desc || `Latest news from ${examName}.`,
    keywords: `${examName}, news, ${newsSlug.replace(/-/g, " ")}, education`,
    alternates: {
      canonical: buildCanonicalUrl(canonicalPath),
    },
    openGraph: {
      title: `${title} | ${examName}`,
      description: description || `Latest news from ${examName}.`,
      url: buildCanonicalUrl(canonicalPath),
      type: "article",
      publishedTime: updated_at,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${examName}`,
      description: description || `Latest news from ${examName}.`,
    },
  };
}

const NewsIndividual = async ({
  params,
}: {
  params: Promise<{ "slug-id": string; "news-slug": string }>;
}) => {
  const { "slug-id": slugId, "news-slug": newsSlugId } = await params;

  const examMatch = slugId.match(/(.+)-(\d+)$/);
  if (!examMatch) return notFound();
  const examId = Number(examMatch[2]);
  if (isNaN(examId)) return notFound();

  const newsMatch = newsSlugId.match(/(.+)-(\d+)$/);
  if (!newsMatch) return notFound();
  const newsId = Number(newsMatch[2]);
  if (isNaN(newsId)) return notFound();

  const exam = await getNewsByExamId(newsId);
  const navExam = await getExamsById(examId, "exam_info");
  // Ensure we have nav data and news article
  if (
    !navExam?.examInformation ||
    !exam?.examInformation ||
    !exam?.news_section?.[0]
  )
    return notFound();

  // Article content
  const news = exam.news_section[0];
  // Prefer exam info from navExam for slugs/nav; fallback to the exam object
  const examInfo = navExam.examInformation || exam.examInformation;
  const examName = examInfo.exam_name || "Unknown Exam";
  const examSlug =
    examInfo.slug?.replace(/-\d+$/, "") ||
    examName.toLowerCase().replace(/\s+/g, "-");
  const correctSlugId = `${examSlug}-${examId}`;
  const correctNewsSlugId = `${newsSlugId.replace(/-\d+$/, "")}-${newsId}`;

  if (slugId !== correctSlugId || newsSlugId !== correctNewsSlugId) {
    redirect(`/exams/${correctSlugId}/news/${correctNewsSlugId}`);
  }

  const { title, updated_at, description, author_name } = news;

  // Sanitize the HTML content for proper table rendering
  const sanitizedDescription = sanitizeHtml(description || "");

  // Build visual breadcrumbs
  const breadcrumbItems = buildExamNewsBreadcrumbTrail(
    examName,
    correctSlugId,
    title,
    correctNewsSlugId
  );

  // Build structured data
  const articleSchema = buildNewsArticleSchema({
    article_id: newsId,
    title,
    slug: correctNewsSlugId,
    description: description || `Latest news from ${examName}.`,
    created_at: updated_at,
    updated_at: updated_at,
    author: {
      author_id: 0,
      author_name: author_name || "TrueScholar Team",
    },
    img1_url: examInfo.exam_logo || "https://www.truescholar.in/logo-dark.webp",
  });

  // Convert visual breadcrumbs (href) to schema breadcrumbs (url)
  const schemaBreadcrumbs = breadcrumbItems.map((item) => ({
    name: item.name,
    url: item.href,
  }));

  const examOrgSchema = {
    "@type": "Organization",
    name: examName,
    logo: examInfo.exam_logo,
    url: `https://www.truescholar.in/exams/${correctSlugId}`,
  };

  const schema = {
    "@context": "https://schema.org" as const,
    "@graph": [
      articleSchema,
      buildBreadcrumbSchema(schemaBreadcrumbs),
      examOrgSchema,
    ],
  };

  return (
    <div className="bg-gray-2 min-h-screen">
      <JsonLd data={schema} id="exam-news-schema" />
      <ExamHead data={examInfo} title={title} />
      {/* Pass nav data from getExamsById to ensure distinctSilos are available for navigation */}
      <ExamNav data={navExam} />

      <div className="container-body lg:grid grid-cols-12 gap-4 pt-4">
        <div className="col-span-3 mt-4 flex justify-center items-start">
          <Image src="/ads/static.svg" height={250} width={500} alt="ads" />
        </div>
        <div className="col-span-9">
          <Breadcrumbs items={breadcrumbItems} showSchema={false} />
          {sanitizedDescription && (
            <TocGenerator content={sanitizedDescription} />
          )}
          <div
            className="prose max-w-none mt-4 text-gray-800"
            dangerouslySetInnerHTML={{
              __html:
                sanitizedDescription ||
                "<p>No additional content available.</p>",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default NewsIndividual;
