import ExamsList from "@/components/page/exam/ExamList";
import React from "react";
import {
  generateListingMetadata,
  JsonLd,
  buildCollectionPageSchema,
  buildStaticBreadcrumbTrail,
  buildBreadcrumbSchema,
} from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo";

export const metadata = generateListingMetadata("exams");

export const revalidate = 86400; // 24 hours

const ExamsPage = () => {
  // Build breadcrumbs
  const breadcrumbItems = buildStaticBreadcrumbTrail("Exams", "/exams");

  // Build schema
  const collectionSchema = buildCollectionPageSchema(
    "Entrance Exams in India",
    "Complete list of entrance exams in India. Get exam dates, eligibility, syllabus, and preparation tips.",
    "/exams",
  );

  // Convert breadcrumbs for schema (href -> url)
  const schemaBreadcrumbs = breadcrumbItems.map((item) => ({
    name: item.name,
    url: item.href,
  }));

  const schema = {
    "@context": "https://schema.org" as const,
    "@graph": [collectionSchema, buildBreadcrumbSchema(schemaBreadcrumbs)],
  };

  return (
    <div className="bg-white">
      <JsonLd data={schema} id="exams-listing-schema" />
      <div className="container-body pt-4 md:pt-12">
        <Breadcrumbs items={breadcrumbItems} showSchema={false} />
      </div>
      <ExamsList />
    </div>
  );
};

export default ExamsPage;
