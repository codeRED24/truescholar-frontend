import React from "react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

const ExamList = dynamic(() => import("@/components/wrapper/ExamListWrapper"));

const CollegeList = dynamic(
  () => import("@/components/wrapper/CollegeListWrapper")
);

interface PageProps {
  params: Promise<{
    filterSlug: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  const { filterSlug } = await params;

  if (filterSlug.includes("exams-")) {
    return <ExamList />;
  } else if (filterSlug.includes("colleges-")) {
    return <CollegeList />;
  } else {
    notFound();
  }
};

export default page;
