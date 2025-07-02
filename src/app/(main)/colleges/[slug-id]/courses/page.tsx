import React from "react";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import { getCollegeCourses } from "@/api/individual/getIndividualCollege";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import { CollegeDTO } from "@/api/@types/college-info";
import CollegeCourseContent from "@/components/page/college/assets/CollegeCourseContent";
import "@/app/styles/tables.css";
import CollegeCourseList from "@/components/page/college/assets/CollegeCourseList";
import Image from "next/image";
import CollegeNews from "@/components/page/college/assets/CollegeNews";
import RatingComponent from "@/components/miscellaneous/RatingComponent";

const BASE_URL = "https://www.truescholar.in";

const parseSlugId = (
  slugId: string
): { collegeId: number; slug: string } | null => {
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return null;
  const collegeId = Number(match[2]);
  return isNaN(collegeId) ? null : { collegeId, slug: match[1] };
};

const generateJSONLD = (type: string, data: Record<string, any>) => ({
  "@context": "https://schema.org",
  "@type": type,
  ...data,
});

const generateBreadcrumbLD = (collegeName: string, slugId: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Colleges",
      item: `${BASE_URL}/colleges`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: collegeName,
      item: `${BASE_URL}/colleges/${slugId}`,
    },
    {
      "@type": "ListItem",
      position: 4,
      name: `${collegeName} Courses`,
      item: `${BASE_URL}/colleges/${slugId}/courses`,
    },
  ],
});

const getCollegeData = async (
  collegeId: number
): Promise<CollegeDTO | null> => {
  const data = await getCollegeCourses(collegeId);
  if (!data?.college_information) return null;

  const hasCourses =
    data.college_information.dynamic_fields?.courses ||
    data.college_information.additional_fields?.college_wise_course_present;
  return hasCourses ? data : null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "slug-id": string }>;
}) {
  const { "slug-id": slugId } = await params;
  const parsed = parseSlugId(slugId);
  if (!parsed) return { title: "College Not Found" };

  const { collegeId } = parsed;
  const college = await getCollegeData(collegeId);
  if (!college) return { title: "College Not Found" };

  const { college_information: collegeInfo, courses_section } = college;
  const collegeSlug = collegeInfo.slug.replace(/-\d+$/, "");
  const courseSection = courses_section.content_section[0] || {};
  const collegeName = collegeInfo.college_name || "College Courses";
  const canonicalUrl = `${BASE_URL}/colleges/${collegeSlug}-${collegeId}/courses`;

  return {
    title: courseSection.title || collegeName,
    description:
      courseSection.meta_desc || "Find details about courses in this college.",
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: courseSection.title || collegeName,
      description:
        courseSection.meta_desc ||
        "Find details about courses in this college.",
      url: canonicalUrl,
    },
  };
}

const CourseInCollege = async ({
  params,
}: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const { "slug-id": slugId } = await params;
  const parsed = parseSlugId(slugId);
  if (!parsed) return notFound();

  const { collegeId } = parsed;
  const collegeData = await getCollegeData(collegeId);
  if (!collegeData) return notFound();

  const { college_information, news_section, courses_section, filter_section } =
    collegeData;

  const collegeName = parsed.slug.replace(/-\d+$/, "");
  const correctSlugId = `${collegeName
    .toLowerCase()
    .replace(/\s+/g, "-")}-${collegeId}`;

  if (slugId !== correctSlugId) {
    redirect(`/colleges/${correctSlugId}/courses`);
  }

  const {
    title: courseTitle = college_information.college_name || "College Courses",
    meta_desc: courseMetaDesc = "Find details about courses in this college.",
    author_name: courseAuthor = "Unknown Author",
    updated_at: courseUpdatedAt,
  } = courses_section.content_section[0] || {};

  const jsonLD = [
    generateJSONLD("CollegeOrUniversity", {
      name: collegeName,
      foundingDate: college_information.founded_year,
      logo: college_information.logo_img,
      description: `${college_information.type_of_institute} institute founded in ${college_information.founded_year}`,
    }),
    generateBreadcrumbLD(collegeName || "Default College Name", correctSlugId),
    generateJSONLD("Article", {
      headline: courseTitle,
      description: courseMetaDesc,
      author: { "@type": "Person", name: courseAuthor },
      datePublished: courseUpdatedAt,
      dateModified: courseUpdatedAt,
    }),
  ].filter(Boolean);

  const extractedData = {
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city,
    state: college_information.state,
    location: college_information.location,
    title: courses_section.content_section?.[0]?.title,
    college_brochure: college_information.college_brochure || "/",
  };

  return (
    <>
      <Script
        id="college-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
      />
      <CollegeHead data={extractedData} />
      <CollegeNav data={college_information} />
      <section className="container-body md:grid grid-cols-4 gap-4 py-4">
        <div className="col-span-3 order-none md:order-1">
          <CollegeCourseContent
            content={courses_section.content_section}
            news={news_section}
          />
          <CollegeCourseList
            courseData={{ groups: courses_section?.groups || [] }}
            courseFilter={courses_section?.filter_section}
            clgName={college_information?.college_name}
          />
          <RatingComponent />
        </div>
        <div className="col-span-1 mt-4">
          <Image src="/ads/static.svg" height={250} width={500} alt="ads" />
          <CollegeNews news={news_section} clgSlug={correctSlugId} />
        </div>
      </section>
    </>
  );
};

export default CourseInCollege;
