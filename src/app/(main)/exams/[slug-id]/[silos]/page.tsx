import { getExamsById } from "@/api/individual/getExamsById";
import ExamContent from "@/components/page/exam/ExamContent";
import { splitSilos } from "@/components/utils/utils";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";

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

  // ✅ Extract available silos for ExamNav
  const availableSilos =
    distinctSilos?.map((silo: { silos: string }) => silo.silos) || [];

  // ✅ Ensure the description exists
  const contentHTML =
    examContent?.description ||
    "<p>Admit card details will be available soon.</p>";

  const breadcrumbLD = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.truescholar.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Exams",
        item: "https://www.truescholar.in/exams",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: examInfo.exam_name,
        item: `https://www.truescholar.in/exams/${correctSlugId}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${examInfo.exam_name} Results`,
        item: `https://www.truescholar.in/exams/${correctSlugId}/results`,
      },
    ],
  };

  const { topic_title, meta_desc, author_name, updated_at } = examContent;

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLD) }}
      />
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLD) }}
      />

      <ExamContent exam={exam} />
    </>
  );
};

export default ExamSiloCard;
