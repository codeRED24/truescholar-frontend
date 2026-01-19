import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { generatePageMetadata, generatePageSchema, JsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo";
import { buildFilterBreadcrumbTrail } from "@/lib/seo/linking/breadcrumbs";

const ExamList = dynamic(() => import("@/components/page/exam/ExamList"));

const CollegeList = dynamic(
  () => import("@/components/page/college/CollegeList"),
);

export const revalidate = 86400; // 24 hours (revalidationTimes.filter)

interface PageProps {
  params: Promise<{
    filterSlug: string;
  }>;
}

/**
 * Parse filter slug to extract filter parameters
 * Examples:
 * - "colleges-stream-engineering" -> { entityType: 'college', stream: 'engineering' }
 * - "colleges-city-delhi" -> { entityType: 'college', city: 'delhi' }
 * - "exams-stream-medical" -> { entityType: 'exam', stream: 'medical' }
 */
const parseFilterSlug = (filterSlug: string) => {
  const isExam = filterSlug.startsWith("exams-");
  const isCollege = filterSlug.startsWith("colleges-");

  if (!isExam && !isCollege) {
    return null;
  }

  const entityType: "college" | "exam" = isCollege ? "college" : "exam";
  const remainder = filterSlug.replace(/^(colleges|exams)-/, "");

  let stream: { id: number; name: string } | undefined;
  let city: { id: number; name: string } | undefined;
  let state: { id: number; name: string } | undefined;

  // Parse stream, city, state from the slug
  // Format: stream-{name}, city-{name}, state-{name}
  const streamMatch = remainder.match(
    /stream-([^-]+(?:-[^-]+)*?)(?=-(?:city|state)|$)/i,
  );
  const cityMatch = remainder.match(
    /city-([^-]+(?:-[^-]+)*?)(?=-(?:stream|state)|$)/i,
  );
  const stateMatch = remainder.match(
    /state-([^-]+(?:-[^-]+)*?)(?=-(?:stream|city)|$)/i,
  );

  if (streamMatch) {
    const streamName = streamMatch[1]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    stream = { id: 0, name: streamName };
  }
  if (cityMatch) {
    const cityName = cityMatch[1]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    city = { id: 0, name: cityName };
  }
  if (stateMatch) {
    const stateName = stateMatch[1]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    state = { id: 0, name: stateName };
  }

  return { entityType, stream, city, state };
};

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { filterSlug } = await params;
  const parsed = parseFilterSlug(filterSlug);

  if (!parsed) {
    return {};
  }

  return generatePageMetadata({
    type: "filter",
    data: {
      entityType: parsed.entityType,
      stream: parsed.stream,
      city: parsed.city,
      state: parsed.state,
      resultCount: 0, // We don't have count at metadata generation time
    },
  });
};

const page = async ({ params }: PageProps) => {
  const { filterSlug } = await params;
  const parsed = parseFilterSlug(filterSlug);

  if (!parsed) {
    notFound();
  }

  // Generate schema
  const schema = generatePageSchema({
    type: "filter",
    entityType: parsed.entityType,
    stream: parsed.stream?.name,
    city: parsed.city?.name,
    state: parsed.state?.name,
  });

  // Build breadcrumbs
  const breadcrumbItems = buildFilterBreadcrumbTrail(
    parsed.entityType === "college" ? "colleges" : "exams",
    {
      stream: parsed.stream
        ? {
            name: parsed.stream.name,
            slug: parsed.stream.name.toLowerCase().replace(/\s+/g, "-"),
          }
        : undefined,
      city: parsed.city
        ? {
            name: parsed.city.name,
            slug: parsed.city.name.toLowerCase().replace(/\s+/g, "-"),
          }
        : undefined,
      state: parsed.state
        ? {
            name: parsed.state.name,
            slug: parsed.state.name.toLowerCase().replace(/\s+/g, "-"),
          }
        : undefined,
    },
  );

  if (filterSlug.includes("exams-")) {
    return (
      <div className="md:py-12 py-0">
        <JsonLd data={schema} id="filter-schema" />
        <div className="container-body">
          <Breadcrumbs items={breadcrumbItems} showSchema={false} />
        </div>
        <ExamList />
      </div>
    );
  } else if (filterSlug.includes("colleges-")) {
    return (
      <div className="md:py-12 py-0">
        <JsonLd data={schema} id="filter-schema" />
        <div className="container-body">
          <Breadcrumbs items={breadcrumbItems} showSchema={false} />
        </div>
        <CollegeList />
      </div>
    );
  } else {
    notFound();
  }
};

export default page;
