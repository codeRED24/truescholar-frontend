import { getExamsById } from "@/api/individual/getExamsById";
import ExamContent from "@/components/page/exam/ExamContent";
import { splitSilos } from "@/components/utils/utils";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import { parseFAQFromHTML } from "@/components/utils/parsefaqschema";

export async function generateMetadata(props: {
  params: Promise<{ "slug-id": string; silos: string }>;
}) {
  const { "slug-id": slugId, silos } = await props.params;
  if (!slugId) return notFound();

  const accurateSilos = splitSilos(silos);

  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return notFound();

  const examId = Number(match[2]);
  if (isNaN(examId)) return notFound();

  let exam;
  try {
    exam = await getExamsById(examId, accurateSilos);
  } catch (error) {
    return notFound();
  }

  if (!exam || !exam.examInformation) return notFound();

  const title = exam.examContent.topic_title || "Exam Details";
  const description =
    exam.examContent.meta_desc || "Find details about this exam.";
  const canonicalUrl = `https://www.truescholar.in/exams/${exam.examInformation.slug}-${examId}/${accurateSilos}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
  };
}

const ExamSiloCard: React.FC<{
  params: Promise<{ "slug-id": string; silos: string }>;
}> = async ({ params }) => {
  const { "slug-id": slugId, silos } = await params;

  if (!slugId) return notFound();
  if (silos === "info") {
    redirect(`/exams/${slugId}`);
  }
  if (silos === "exam-info") {
    redirect(`/exams/${slugId}`);
  }
  if (silos === "news") {
    redirect(`/exams/${slugId}/news`);
  }
  const accurateSilos = splitSilos(silos);

  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return notFound();

  const examId = Number(match[2]);
  if (isNaN(examId)) return notFound();

  let exam;
  try {
    exam = await getExamsById(examId, accurateSilos);
  } catch (error) {
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

  const { examInformation: examInfo, examContent, distinctSilos } = exam;

  const correctSlugId = `${examInfo.exam_name
    .replace(/\s+/g, "-")
    .toLowerCase()}-${examId}`;

  if (slugId !== correctSlugId) {
    return redirect(`/exams/${correctSlugId}/${silos}`);
  }

  const { topic_title, meta_desc, author_name, updated_at, description } =
    examContent;

  // FAQ Schema for exam-faq silos
  const faqLD =
    accurateSilos === "exam_faq"
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: parseFAQFromHTML(description || "").map((faq, index) => ({
            "@type": "Question",
            name: faq.question || `FAQ ${index + 1}`,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer || "Answer not available",
            },
          })),
        }
      : null;

  const articleLD = {
    "@context": "https://schema.org",
    "@type": "Article",
    inLanguage: "en",
    headline: topic_title,
    description:
      meta_desc || "Details of the admission process for this college.",
    author: { "@type": "Person", name: author_name || "Unknown Author" },
    datePublished: updated_at,
    dateModified: updated_at,
    image: {
      "@type": "ImageObject",
      url: examInfo.examInformation?.exam_logo,
      height: 800,
      width: 800,
    },
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
      "@id": `https://www.truescholar.in/exams/${correctSlugId}/info`,
    },
  };

  return (
    <>
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLD) }}
      />
      {faqLD && (
        <Script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLD) }}
        />
      )}

      <ExamContent exam={exam} />
    </>
  );
};

export default ExamSiloCard;
