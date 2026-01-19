import { getCollegeHighlightsById } from "@/api/individual/getIndividualCollege";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import TocGenerator from "@/components/miscellaneous/TocGenerator";
import { notFound, redirect } from "next/navigation";
import React from "react";
import "@/app/styles/tables.css";
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

const parseSlugId = (slugId: string) => {
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return null;
  const collegeId = Number(match[2]);
  return isNaN(collegeId) ? null : { collegeId, slug: match[1] };
};

export async function generateMetadata(props: {
  params: Promise<{ "slug-id": string }>;
}) {
  const params = await props.params;
  const slugId = params["slug-id"];
  const parsed = parseSlugId(slugId);

  if (!parsed) {
    return generateErrorMetadata("not-found", "college");
  }

  try {
    const { collegeId } = parsed;
    const college = await getCollegeHighlightsById(collegeId);

    if (!college) {
      return generateErrorMetadata("not-found", "college");
    }

    const { college_information, highlight_section } = college;
    const highlight = highlight_section?.[0];

    // Use the unified metadata generator (using generic tab since highlights isn't a standard tab)
    return generatePageMetadata({
      type: "college-tab",
      data: {
        college_id: collegeId,
        college_name: college_information.college_name,
        slug: college_information.slug,
        city: college_information.city,
        state: college_information.state,
        logo_img: college_information.logo_img,
        tab: "generic" as any,
        tabContent: {
          title: highlight?.title,
          meta_desc: highlight?.meta_desc,
          seo_param: highlight?.seo_param,
        },
      },
      content: highlight?.description,
    });
  } catch {
    return generateErrorMetadata("error", "college");
  }
}

export const revalidate = 43200; // 12 hours (revalidationTimes.collegeSub)

const CollegeHighlights = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const params = await props.params;
  const { "slug-id": slugId } = params;
  const parsed = parseSlugId(slugId);
  if (!parsed) return notFound();

  const { collegeId } = parsed;
  const college = await getCollegeHighlightsById(collegeId);
  if (!college) return notFound();

  const { college_information, highlight_section, news_section } = college;
  const trimmedSlug = college_information?.slug.replace(/(?:-\d+)+$/, "") || "";
  const correctSlugId = `${trimmedSlug}-${collegeId}`;

  if (slugId !== correctSlugId) {
    return redirect(`/colleges/${correctSlugId}/highlights`);
  }

  const highlight = highlight_section?.[0] || {};
  const description = highlight.description || "";

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
    tab: "highlights",
    tabLabel: "Highlights",
    tabPath: "/highlights",
  });

  // Build breadcrumb trail
  const breadcrumbItems = buildCollegeBreadcrumbTrail(
    college_information.college_name,
    correctSlugId,
    "generic" as any
  );

  // Override the last breadcrumb to say "Highlights"
  if (breadcrumbItems.length > 0) {
    breadcrumbItems[breadcrumbItems.length - 1] = {
      name: "Highlights",
      href: `/colleges/${correctSlugId}/highlights`,
      current: true,
    };
  }

  const extractedData = {
    college_id: college_information.college_id,
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city,
    state: college_information.state,
    title: highlight.title || "",
    location: college_information.location,
    college_brochure: college_information.college_brochure || "/",
  };

  return (
    <>
      <JsonLd data={schema} id="college-highlights-schema" />
      <div className="bg-gray-2">
        <CollegeHead data={extractedData} />
        <CollegeNav data={college_information} />

        <div className="container-body md:grid grid-cols-12 gap-4 pt-4">
          <div className="col-span-3 mt-4">
            <Image src="/ads/static.svg" height={250} width={500} alt="ads" />
            <CollegeNews news={news_section} clgSlug={correctSlugId} />
          </div>
          <div className="col-span-9">
            <Breadcrumbs
              items={breadcrumbItems}
              className="mb-4"
              showSchema={false}
            />
            {description && <TocGenerator content={description} />}
            <div dangerouslySetInnerHTML={{ __html: description }} />
            <RatingComponent />
          </div>
        </div>
      </div>
    </>
  );
};

export default CollegeHighlights;
