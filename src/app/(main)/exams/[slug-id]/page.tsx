import React from "react";
import { notFound, redirect } from "next/navigation";
import { getExamsById } from "@/api/individual/getExamsById";
import { GreExamDTO } from "@/api/@types/exam-type";
import ExamContent from "@/components/page/exam/ExamContent";
import {
  generatePageMetadata,
  generatePageSchema,
  generateErrorMetadata,
  JsonLd,
  buildExamBreadcrumbTrail,
  buildExamUrl,
} from "@/lib/seo";

interface IndividualExamProps {
  params: Promise<{ "slug-id": string }>;
}

const parseSlugId = (slugId: string) => {
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return null;
  const examId = Number(match[2]);
  return isNaN(examId) ? null : { examId, slug: match[1] };
};

export async function generateMetadata({ params }: IndividualExamProps) {
  const { "slug-id": slugId } = await params;
  const parsed = parseSlugId(slugId);

  if (!parsed) {
    return generateErrorMetadata("not-found", "exam");
  }

  try {
    const exam = (await getExamsById(parsed.examId, "exam_info")) as GreExamDTO;

    if (!exam || !exam.examContent || !exam.examInformation) {
      return generateErrorMetadata("not-found", "exam");
    }

    const { examInformation, examContent } = exam;

    // Use the unified metadata generator
    return generatePageMetadata({
      type: "exam",
      data: {
        exam_id: parsed.examId,
        exam_name: examInformation.exam_name,
        exam_full_name:
          examInformation.exam_shortname || examInformation.exam_name,
        slug: examInformation.slug || examInformation.exam_name,
        exam_description: examInformation.exam_description,
        logo_img: examInformation.exam_logo ?? undefined,
        seo: {
          title: examContent.topic_title,
          meta_desc: examContent.meta_desc,
          seo_param: examContent.seo_param ?? undefined,
        },
      },
      content: examContent.description,
    });
  } catch {
    return generateErrorMetadata("error", "exam");
  }
}

export const revalidate = 21600; // 6 hours (revalidationTimes.exam)

const IndividualExam = async ({ params }: IndividualExamProps) => {
  const { "slug-id": slugId } = await params;
  const parsed = parseSlugId(slugId);

  if (!parsed) {
    return notFound();
  }

  let exam: GreExamDTO | undefined;
  try {
    exam = (await getExamsById(parsed.examId, "exam_info")) as GreExamDTO;
  } catch {
    return notFound();
  }

  if (!exam || !exam.examContent || !exam.examInformation) {
    return notFound();
  }

  const { examInformation } = exam;
  const examName =
    examInformation.slug || examInformation.exam_name || "default-exam-name";

  const correctUrl = buildExamUrl(examName, parsed.examId);
  // Extract correctSlugId from URL
  const correctSlugId = correctUrl.split("/").pop() || "";

  if (slugId !== correctSlugId) {
    return redirect(correctUrl);
  }

  // Generate schema using the SEO library
  const schema = generatePageSchema({
    type: "exam",
    data: {
      exam_id: parsed.examId,
      exam_name: examInformation.exam_name,
      exam_full_name:
        examInformation.exam_shortname || examInformation.exam_name,
      slug: examInformation.slug || examInformation.exam_name,
      exam_description: examInformation.exam_description,
      logo_img: examInformation.exam_logo ?? undefined,
      conducting_body: examInformation.conducting_authority,
      exam_mode: examInformation.mode_of_exam,
      exam_level: examInformation.exam_level,
      application_start_date: examInformation.application_start_date,
      application_end_date: examInformation.application_end_date,
      exam_date: examInformation.exam_date,
      result_date: examInformation.result_date ?? undefined,
    },
  });

  // Build breadcrumb trail
  const breadcrumbItems = buildExamBreadcrumbTrail(
    examInformation.exam_name,
    correctSlugId,
  );

  return (
    <>
      <JsonLd data={schema} id="exam-schema" />
      <ExamContent exam={exam} breadcrumbs={breadcrumbItems} />
    </>
  );
};

export default IndividualExam;
