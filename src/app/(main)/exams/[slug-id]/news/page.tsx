import React from "react";
import { getExamNewsById } from "@/api/individual/getExamNewsById";
import { getExamsById } from "@/api/individual/getExamsById";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ExamHead from "@/components/page/exam/ExamHead";
import ExamNav from "@/components/page/exam/ExamNav";
import Image from "next/image";
import { createSlugFromTitle } from "@/components/utils/utils";
import "@/app/styles/tables.css";
import { humanize } from "inflection";
import {
  generatePageMetadata,
  generatePageSchema,
  generateErrorMetadata,
  JsonLd,
  buildExamBreadcrumbTrail,
} from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo";

const formatDateWord = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const trimText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const parseSlugId = (slugId: string) => {
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return null;
  const examId = Number(match[2]);
  return isNaN(examId) ? null : { examId, slug: match[1] };
};

export async function generateMetadata(props: {
  params: Promise<{ "slug-id": string }>;
}) {
  const params = await props.params;
  const slugId = params["slug-id"];
  const parsed = parseSlugId(slugId);

  if (!parsed) {
    return generateErrorMetadata("not-found", "exam");
  }

  try {
    const navExam = await getExamsById(parsed.examId, "exam_info");
    const newsData = await getExamNewsById(parsed.examId);

    if (!navExam || !newsData) {
      return generateErrorMetadata("not-found", "exam");
    }

    const { examInformation } = navExam;
    const newsItem = newsData.news_section?.[0];

    // Use the unified metadata generator
    return generatePageMetadata({
      type: "exam-silo",
      data: {
        exam_id: parsed.examId,
        exam_name: examInformation.exam_name,
        exam_full_name: examInformation.exam_full_name,
        slug: examInformation.slug || examInformation.exam_name,
        exam_description: examInformation.exam_description,
        logo_img: examInformation.exam_logo,
        silo: "news",
        siloContent: {
          title: newsItem?.title
            ? humanize(newsItem.title).replace(/-/g, " ")
            : `${examInformation.exam_name} News`,
          meta_desc:
            newsItem?.meta_desc ||
            `Latest news and updates from ${examInformation.exam_name}.`,
          seo_param: newsItem?.seo_param,
        },
      },
    });
  } catch {
    return generateErrorMetadata("error", "exam");
  }
}

export const revalidate = 43200; // 12 hours (revalidationTimes.examSilo)

const ExamNews = async ({
  params,
}: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const { "slug-id": slugId } = await params;
  const parsed = parseSlugId(slugId);

  if (!parsed) return notFound();

  const navExam = await getExamsById(parsed.examId, "exam_info");
  const newsData = await getExamNewsById(parsed.examId);

  if (!navExam?.examInformation || !newsData?.news_section) return notFound();

  const { examInformation } = navExam;

  const newsList = newsData.news_section;
  const examName = examInformation?.exam_name || "Unknown Exam";
  const trimmedExamName =
    examInformation?.slug?.replace(/-\d+$/, "") ||
    examName.toLowerCase().replace(/\s+/g, "-");
  const correctSlugId = `${trimmedExamName}-${parsed.examId}`;

  if (slugId !== correctSlugId) {
    redirect(`/exams/${correctSlugId}/news`);
  }

  if (!newsList || newsList.length === 0) {
    return notFound();
  }

  // Generate schema using the SEO library
  const schema = generatePageSchema({
    type: "exam-silo",
    data: {
      exam_id: parsed.examId,
      exam_name: examInformation.exam_name,
      exam_full_name: examInformation.exam_full_name,
      slug: examInformation.slug || examInformation.exam_name,
      exam_description: examInformation.exam_description,
      logo_img: examInformation.exam_logo,
      conducting_body: examInformation.conducting_body,
    },
    silo: "news",
    siloLabel: "News",
    siloPath: "/news",
  });

  // Build breadcrumb trail
  const breadcrumbItems = buildExamBreadcrumbTrail(
    examInformation.exam_name,
    correctSlugId,
    "news"
  );

  return (
    <div className="bg-gray-2 min-h-screen">
      <JsonLd data={schema} id="exam-news-schema" />
      <ExamHead data={examInformation} title={`${examName} News`} />
      <ExamNav data={navExam} />
      <div className="container-body lg:grid grid-cols-12 gap-4 pt-4">
        <div className="col-span-3 mt-4 flex justify-center items-start">
          <Image src="/ads/static.svg" height={250} width={500} alt="ads" />
        </div>
        <div className="col-span-9 mt-4">
          <Breadcrumbs
            items={breadcrumbItems}
            className="mb-4"
            showSchema={false}
          />
          <div className="flex gap-4 flex-col ">
            {newsList.map(
              (newsItem: {
                id: number;
                title: string;
                updated_at: string;
                meta_desc?: string;
              }) => (
                <div
                  key={newsItem.id}
                  className="p-4 bg-white shadow-md rounded-2xl"
                >
                  <Link
                    href={`/exams/${correctSlugId}/news/${createSlugFromTitle(
                      newsItem.title
                    )}-${newsItem.id}`}
                  >
                    <h2 className="text-lg font-medium hover:underline">
                      {humanize(newsItem.title).replace(/-/g, " ")}
                    </h2>
                  </Link>
                  <p className="text-sm text-gray-600">
                    {formatDateWord(newsItem.updated_at)}
                  </p>
                  {newsItem.meta_desc && (
                    <div
                      className="text-gray-700 mt-2"
                      dangerouslySetInnerHTML={{
                        __html: trimText(newsItem.meta_desc, 150),
                      }}
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamNews;
