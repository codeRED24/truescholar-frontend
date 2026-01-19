import React from "react";
import { notFound, redirect } from "next/navigation";
import { getCollegeById } from "@/api/individual/getIndividualCollege";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import CollegeInfoContent from "@/components/page/college/assets/CollegeInfoContent";
import "@/app/styles/tables.css";
import CollegeNews from "@/components/page/college/assets/CollegeNews";
import Image from "next/image";
import {
  generatePageMetadata,
  generatePageSchema,
  generateErrorMetadata,
  JsonLd,
  buildCollegeBreadcrumbTrail,
  buildCollegeUrl,
} from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo";

export async function generateMetadata(props: {
  params: Promise<{ "slug-id": string }>;
}) {
  const params = await props.params;
  const slugId = params["slug-id"];

  // Parse slug to extract college ID
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) {
    return generateErrorMetadata("not-found", "college");
  }

  const collegeId = Number(match[2]);
  if (isNaN(collegeId)) {
    return generateErrorMetadata("not-found", "college");
  }

  try {
    const college = await getCollegeById(collegeId, true);
    if (!college) {
      return generateErrorMetadata("not-found", "college");
    }

    const { info_section, college_information } = college;
    const info = info_section?.[0];

    // Use the unified metadata generator
    return generatePageMetadata({
      type: "college",
      data: {
        college_id: collegeId,
        college_name: college_information.college_name,
        slug: college_information.slug,
        city: college_information.city,
        state: college_information.state,
        logo_img: college_information.logo_img,
        seo: {
          title: info?.title,
          meta_desc: info?.meta_desc,
          seo_param: info?.seo_param,
        },
      },
      content: info?.content,
    });
  } catch {
    return generateErrorMetadata("error", "college");
  }
}

export const revalidate = 21600; // 6 hours (revalidationTimes.college)

const IndividualCollege = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const params = await props.params;
  const { "slug-id": slugId } = params;
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return notFound();

  const collegeId = Number(match[2]);
  if (isNaN(collegeId)) return notFound();

  const college = await getCollegeById(collegeId);
  if (!college) return notFound();

  const { college_information, info_section, popular_courses, news_section } =
    college;

  const correctUrl = buildCollegeUrl(
    college_information.slug,
    college_information.college_id,
  );
  // Extract correctSlugId from the URL (e.g. /colleges/slug-123 -> slug-123)
  const correctSlugId = correctUrl.split("/").pop() || "";

  // Redirect to canonical URL if slug doesn't match
  if (slugId !== correctSlugId) {
    return redirect(correctUrl);
  }

  // Generate schema using the SEO library
  const schema = generatePageSchema({
    type: "college",
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
  });

  // Build breadcrumb trail
  const breadcrumbItems = buildCollegeBreadcrumbTrail(
    college_information.college_name,
    correctSlugId,
  );

  const extractedData = {
    college_id: college_information.college_id,
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city,
    state: college_information.state,
    college_brochure: college_information.college_brochure || "/",
    title: info_section?.[0]?.title || "",
    location: college_information.location,
  };

  return (
    <>
      <JsonLd data={schema} id="college-schema" />
      <CollegeHead data={extractedData} />
      <CollegeNav data={college_information} />
      <section className="container-body md:grid grid-cols-4 gap-4 py-4">
        <div className="col-span-3 order-0 md:order-1">
          <Breadcrumbs
            items={breadcrumbItems}
            className=""
            showSchema={false}
          />
          <CollegeInfoContent
            data={college_information}
            info={info_section}
            news={news_section}
            course={popular_courses}
          />
        </div>
        <div className="col-span-1 mt-4">
          <Image src="/ads/static.svg" height={250} width={500} alt="ads" />
          <CollegeNews news={news_section} clgSlug={correctSlugId} />
        </div>
      </section>
    </>
  );
};

export default React.memo(IndividualCollege);
