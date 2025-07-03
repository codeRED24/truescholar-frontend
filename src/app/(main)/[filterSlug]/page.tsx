import ExamsList from "@/components/page/exam/ExamList";
import React from "react";
import { notFound } from "next/navigation";
import CollegeList from "@/components/page/college/CollegeList";

interface PageProps {
  params: Promise<{
    filterSlug: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  const { filterSlug } = await params;

  if (filterSlug.includes("exams-")) {
    return <ExamsList />;
  } else if (filterSlug.includes("colleges-")) {
    return <CollegeList />;
  } else {
    notFound();
  }
};

export default page;
