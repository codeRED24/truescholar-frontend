import React from "react";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import { getExamsById } from "@/api/individual/getExamsById";
import { GreExamDTO } from "@/api/@types/exam-type";
import ExamContent from "@/components/page/exam/ExamContent";

interface IndividualExamProps {
  params: Promise<{ "slug-id": string }>;
}

export async function generateMetadata({
  params,
}: IndividualExamProps): Promise<{
  title: string;
  description?: string;
  alternates?: { canonical: string };
  openGraph?: { title: string; description: string; url: string };
}> {
  const { "slug-id": slugId } = await params;

  const match = slugId.match(/.*-(\d+)$/);
  if (!match) {
    return notFound();
  }

  const examId = Number(match[1]);
  if (isNaN(examId)) {
    return notFound();
  }

  let exam: GreExamDTO | undefined;
  try {
    exam = (await getExamsById(examId, "exam_info")) as GreExamDTO;
  } catch (error) {
    return notFound();
  }

  if (!exam || !exam.examContent) {
    return notFound();
  }

  const examName =
    exam.examInformation.slug ||
    exam.examInformation.exam_name ||
    "default-exam-name";
  const correctSlugId = `${examName
    .replace(/\s+/g, "-")
    .toLowerCase()}-${examId}`;

  const title =
    exam.examContent.topic_title || `${exam.examInformation.exam_name} Info`;
  const description =
    exam.examContent.meta_desc ||
    exam.examInformation.exam_description ||
    "Detailed information about this exam.";
  const canonicalUrl = `https://www.truescholar.in/exams/${correctSlugId}`;

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

const IndividualExam = async ({ params }: IndividualExamProps) => {
  const { "slug-id": slugId } = await params;

  const match = slugId.match(/.*-(\d+)$/);
  if (!match) {
    return notFound();
  }

  const examId = Number(match[1]);
  if (isNaN(examId)) {
    return notFound();
  }

  let exam: GreExamDTO | undefined;
  try {
    exam = (await getExamsById(examId, "exam_info")) as GreExamDTO;
  } catch (error) {
    return notFound();
  }
  if (!exam || !exam.examContent) {
    return notFound();
  }

  const examName =
    exam.examInformation.slug ||
    exam.examInformation.exam_name ||
    "default-exam-name";
  const correctSlugId = `${examName
    .replace(/\s+/g, "-")
    .toLowerCase()}-${examId}`;

  if (slugId !== correctSlugId) {
    redirect(`/exams/${correctSlugId}`);
  }

  return (
    <>
      <ExamContent exam={exam} />
    </>
  );
};

export default IndividualExam;
