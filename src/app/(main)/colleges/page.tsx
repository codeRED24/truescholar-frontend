import React from "react";
import dynamic from "next/dynamic";
import {
  generateListingMetadata,
  JsonLd,
  buildCollectionPageSchema,
  buildBreadcrumbSchema,
  buildStaticBreadcrumbTrail,
} from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo";

const CollegeList = dynamic(
  () => import("@/components/page/college/CollegeList"),
  {
    loading: () => (
      <div className="animate-pulse p-4 bg-gray-200 rounded-2xl h-32" />
    ),
  },
);

// Generate metadata using the SEO library
export const metadata = generateListingMetadata("colleges");

export const revalidate = 86400; // 24 hours

const Colleges = () => {
  // Build breadcrumbs
  const breadcrumbItems = buildStaticBreadcrumbTrail("Colleges", "/colleges");

  // Build schema
  const collectionSchema = buildCollectionPageSchema(
    "Top Colleges in India",
    "Discover top colleges in India with TrueScholar. Compare courses, fees, eligibility, rankings, and more.",
    "/colleges",
  );

  const breadcrumbSchema = buildBreadcrumbSchema(
    breadcrumbItems.map((item) => ({
      name: item.name,
      url: item.href,
    })),
  );

  const schema = {
    "@context": "https://schema.org" as const,
    "@graph": [collectionSchema, breadcrumbSchema],
  };

  return (
    <div className="md:py-12 py-0">
      <JsonLd data={schema} id="colleges-listing-schema" />
      <div className="container-body">
        <Breadcrumbs items={breadcrumbItems} showSchema={false} />
      </div>
      <div>
        <CollegeList />
      </div>
    </div>
  );
};

export default Colleges;
