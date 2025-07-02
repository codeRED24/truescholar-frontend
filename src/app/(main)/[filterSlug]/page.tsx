import ExamsList from "@/components/page/exam/ExamList";
import React from "react";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    filterSlug: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  const { filterSlug } = await params;

  // Check if filterSlug contains "exams"
  if (!filterSlug.includes("exams-")) {
    notFound();
  }

  return (
    <div>
      <ExamsList />
    </div>
  );
};

export default page;
