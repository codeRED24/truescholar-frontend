import { getExamsById } from "@/api/individual/getExamsById";
import ExamContent from "@/components/page/exam/ExamContent";
import { splitSilos } from "@/components/utils/utils";
import { notFound, redirect } from "next/navigation";
import { parseFAQFromHTML } from "@/components/utils/parsefaqschema";
import slugify from "slug";
import {
  generatePageMetadata,
  generatePageSchema,
  generateErrorMetadata,
  JsonLd,
  buildExamBreadcrumbTrail,
  examSiloConfig,
  buildExamUrl,
  type FAQItem,
} from "@/lib/seo";

const parseSlugId = (slugId: string) => {
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return null;
  const examId = Number(match[2]);
  return isNaN(examId) ? null : { examId, slug: match[1] };
};

// Map silo slug to config key
const getSiloConfigKey = (silos: string): keyof typeof examSiloConfig => {
  const mapping: Record<string, keyof typeof examSiloConfig> = {
    "exam-syllabus": "exam-syllabus",
    "exam-pattern": "exam-pattern",
    "exam-cutoff": "exam-cutoff",
    "exam-result": "exam-result",
    "admit-card": "admit-card",
    "exam-dates": "exam-dates",
    "exam-eligibility": "exam-eligibility",
    "exam-registration": "exam-registration",
    news: "news",
  };
  return mapping[silos] || "info";
};

export async function generateMetadata(props: {
  params: Promise<{ "slug-id": string; silos: string }>;
}) {
  const { "slug-id": slugId, silos } = await props.params;
  if (!slugId) return generateErrorMetadata("not-found", "exam");

  const parsed = parseSlugId(slugId);
  if (!parsed) return generateErrorMetadata("not-found", "exam");

  const accurateSilos = splitSilos(silos);

  try {
    const exam = await getExamsById(parsed.examId, accurateSilos);

    if (!exam || !exam.examInformation) {
      return generateErrorMetadata("not-found", "exam");
    }

    const { examInformation, examContent } = exam;
    const siloKey = getSiloConfigKey(silos);

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
        silo: siloKey,
        siloContent: {
          title: examContent?.topic_title,
          meta_desc: examContent?.meta_desc,
          seo_param: examContent?.seo_param,
        },
      },
      content: examContent?.description,
    });
  } catch {
    return generateErrorMetadata("error", "exam");
  }
}

export const revalidate = 43200; // 12 hours (revalidationTimes.examSilo)

const ExamSiloCard: React.FC<{
  params: Promise<{ "slug-id": string; silos: string }>;
}> = async ({ params }) => {
  const { "slug-id": slugId, silos } = await params;

  if (!slugId) return notFound();

  // Handle redirects for special silos
  if (silos === "info" || silos === "exam-info") {
    redirect(`/exams/${slugId}`);
  }
  if (silos === "news") {
    redirect(`/exams/${slugId}/news`);
  }

  const parsed = parseSlugId(slugId);
  if (!parsed) return notFound();

  const accurateSilos = splitSilos(silos);

  let exam;
  try {
    exam = await getExamsById(parsed.examId, accurateSilos);
  } catch {
    return notFound();
  }

  if (
    !exam ||
    !exam.examInformation ||
    !exam.examContent ||
    !exam.distinctSilos
  ) {
    return notFound();
  }

  const { examInformation: examInfo, examContent } = exam;

  const correctUrl = buildExamUrl(
    examInfo.slug || examInfo.exam_name,
    parsed.examId
  );
  // Extract correctSlugId
  const correctSlugId = correctUrl.split("/").pop() || "";

  if (slugId !== correctSlugId) {
    return redirect(`/exams/${correctSlugId}/${silos}`);
  }

  // Parse FAQs for FAQ silo
  const parsedFAQs =
    accurateSilos === "exam_faq"
      ? parseFAQFromHTML(examContent.description || "")
      : [];

  const faqItems: FAQItem[] = parsedFAQs.map((faq, index) => ({
    question: faq.question || `FAQ ${index + 1}`,
    answer: faq.answer || "Answer not available",
  }));

  // Get silo label for breadcrumbs
  const siloKey = getSiloConfigKey(silos);
  const siloConfig = examSiloConfig[siloKey];
  const siloLabel = siloConfig?.label || silos;

  // Generate schema using the SEO library
  const schema = generatePageSchema({
    type: "exam-silo",
    data: {
      exam_id: parsed.examId,
      exam_name: examInfo.exam_name,
      exam_full_name: examInfo.exam_full_name,
      slug: examInfo.slug || examInfo.exam_name,
      exam_description: examInfo.exam_description,
      logo_img: examInfo.exam_logo,
      conducting_body: examInfo.conducting_body,
      exam_mode: examInfo.exam_mode,
      exam_level: examInfo.exam_level,
      application_start_date: examInfo.application_start_date,
      application_end_date: examInfo.application_end_date,
      exam_date: examInfo.exam_date,
      result_date: examInfo.result_date,
    },
    silo: siloKey,
    siloLabel,
    siloPath: `/${silos}`,
    faqs: faqItems.length > 0 ? faqItems : undefined,
  });

  // Build breadcrumb trail
  const breadcrumbItems = buildExamBreadcrumbTrail(
    examInfo.exam_name,
    correctSlugId,
    siloKey
  );

  return (
    <>
      <JsonLd data={schema} id="exam-silo-schema" />
      <ExamContent exam={exam} breadcrumbs={breadcrumbItems} />
    </>
  );
};

export default ExamSiloCard;
