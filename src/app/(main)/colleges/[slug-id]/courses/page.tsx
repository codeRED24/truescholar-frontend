import React from "react";
import { notFound, redirect } from "next/navigation";
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
import {
  generatePageMetadata,
  generatePageSchema,
  generateErrorMetadata,
  JsonLd,
  buildCollegeBreadcrumbTrail,
} from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo";

const parseSlugId = (
  slugId: string,
): { collegeId: number; slug: string } | null => {
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return null;
  const collegeId = Number(match[2]);
  return isNaN(collegeId) ? null : { collegeId, slug: match[1] };
};

const getCollegeData = async (
  collegeId: number,
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

  if (!parsed) {
    return generateErrorMetadata("not-found", "college");
  }

  try {
    const { collegeId } = parsed;
    const college = await getCollegeData(collegeId);

    if (!college) {
      return generateErrorMetadata("not-found", "college");
    }

    const { college_information, courses_section } = college;
    const courseSection = courses_section.content_section[0];

    // Use the unified metadata generator
    return generatePageMetadata({
      type: "college-tab",
      data: {
        college_id: collegeId,
        college_name: college_information.college_name,
        slug: college_information.slug,
        city: college_information.city,
        state: college_information.state,
        logo_img: college_information.logo_img,
        tab: "courses",
        tabContent: {
          title: courseSection?.title,
          meta_desc: courseSection?.meta_desc,
          seo_param: courseSection?.seo_param,
        },
      },
      content: courseSection?.description,
    });
  } catch {
    return generateErrorMetadata("error", "college");
  }
}

export const revalidate = 43200; // 12 hours (revalidationTimes.collegeSub)

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

  const { college_information, news_section, courses_section } = collegeData;

  const baseSlug = college_information.slug?.replace(/(?:-\d+)+$/, "") || "";
  const correctSlugId = `${baseSlug}-${collegeId}`;

  if (slugId !== correctSlugId) {
    redirect(`/colleges/${correctSlugId}/courses`);
  }

  // Generate schema using the SEO library
  const schema = generatePageSchema({
    type: "college-tab",
    data: {
      college_id: collegeId,
      college_name: college_information.college_name,
      slug: college_information.slug,
      logo_img: college_information.logo_img,
      city: college_information.city,
      state: college_information.state,
      location: college_information.location,
      college_website: college_information.college_website,
      college_email: college_information.college_email,
      college_phone: college_information.college_phone,
    },
    tab: "courses",
    tabLabel: "Courses",
    tabPath: "/courses",
  });

  // Build breadcrumb trail
  const breadcrumbItems = buildCollegeBreadcrumbTrail(
    college_information.college_name,
    correctSlugId,
    "courses",
  );

  const extractedData = {
    college_id: college_information.college_id,
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
      <JsonLd data={schema} id="college-courses-schema" />
      <CollegeHead data={extractedData} />
      <CollegeNav data={college_information} />
      <section className="container-body md:grid grid-cols-4 gap-4 py-4">
        <div className="col-span-3 order-0 md:order-1">
          <Breadcrumbs
            items={breadcrumbItems}
            className="mb-4"
            showSchema={false}
          />
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
