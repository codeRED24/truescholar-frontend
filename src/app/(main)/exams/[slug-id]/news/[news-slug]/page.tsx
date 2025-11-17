import { getNewsByExamId } from "@/api/individual/getNewsByExamId";
import { getExamsById } from "@/api/individual/getExamsById";
import ExamHead from "@/components/page/exam/ExamHead";
import ExamNav from "@/components/page/exam/ExamNav";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import Image from "next/image";
import { sanitizeHtml } from "@/components/utils/sanitizeHtml";
import TocGenerator from "@/components/miscellaneous/TocGenerator";
import "@/app/styles/tables.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "slug-id": string; "news-slug": string }>;
}) {
  const { "slug-id": slugId, "news-slug": newsSlugId } = await params;

  const examMatch = slugId.match(/(.+)-(\d+)$/);
  if (!examMatch) return { title: "Exam Not Found" };
  const examId = Number(examMatch[2]);
  if (isNaN(examId)) return { title: "Invalid Exam" };

  const newsMatch = newsSlugId.match(/(.+)-(\d+)$/);
  if (!newsMatch) return { title: "News Not Found" };
  const newsId = Number(newsMatch[2]);
  if (isNaN(newsId)) return { title: "Invalid News" };

  // Nav data should come from the `getExamsById` endpoint (silo: exam_info)
  const navExam = await getExamsById(examId, "exam_info");
  // Fetch the actual news content using the existing endpoint
  const exam = await getNewsByExamId(newsId);
  if (!exam?.news_section?.[0]) return { title: "News Not Found" };

  const { title, description, updated_at, meta_desc } = exam.news_section[0];

  const examName = exam.examInformation?.exam_name || "Unknown Exam";
  const examSlug =
    exam.examInformation?.slug?.replace(/-\d+$/, "") ||
    examName.toLowerCase().replace(/\s+/g, "-");
  const correctSlugId = `${examSlug}-${examId}`;
  const newsSlug = newsSlugId.replace(/-\d+$/, "");

  return {
    title: `${title} | ${examName} News`,
    description: meta_desc || `Latest news from ${examName}.`,
    keywords: `${examName}, news, ${newsSlug}, education`,
    alternates: {
      canonical: `https://www.truescholar.in/exams/${correctSlugId}/news/${newsSlug}-${newsId}`,
    },
    openGraph: {
      title: `${title} | ${examName}`,
      description: description || `Latest news from ${examName}.`,
      url: `https://www.truescholar.in/exams/${correctSlugId}/news/${newsSlug}-${newsId}`,
      type: "article",
      publishedTime: updated_at,
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

  const { title, updated_at, description, author_name, author_img, author_id } =
    news;

  // Sanitize the HTML content for proper table rendering
  const sanitizedDescription = sanitizeHtml(description || "");

  // Structured data (JSON-LD)
  const jsonLD = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: examName,
      logo: examInfo.exam_logo,
      url: `https://www.truescholar.in/exams/${correctSlugId}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: title,
      description: description || `Latest news from ${examName}.`,
      author: { "@type": "Person", name: author_name || "Unknown Author" },
      datePublished: updated_at,
      dateModified: updated_at,
      image: examInfo.exam_logo || "https://www.truescholar.in/logo-dark.webp",
      publisher: {
        "@type": "Organization",
        name: "TrueScholar",
        logo: {
          "@type": "ImageObject",
          url: "https://www.truescholar.in/logo-dark.webp",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://www.truescholar.in/exams/${correctSlugId}/news/${correctNewsSlugId}`,
      },
    },
  ];

  return (
    <div className="bg-gray-2 min-h-screen">
      <Script
        id="news-individual-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
      />
      <ExamHead data={examInfo} title={title} />
      {/* Pass nav data from getExamsById to ensure distinctSilos are available for navigation */}
      <ExamNav data={navExam} />

      <div className="container-body lg:grid grid-cols-12 gap-4 pt-4">
        <div className="col-span-3 mt-4 flex justify-center items-start">
          <Image src="/ads/static.svg" height={250} width={500} alt="ads" />
        </div>
        <div className="col-span-9">
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
