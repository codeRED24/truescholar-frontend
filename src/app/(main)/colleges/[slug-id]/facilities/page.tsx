import { getCollegeInfrastructure } from "@/api/individual/getIndividualCollege";
import { notFound, redirect } from "next/navigation";
import "@/app/styles/tables.css";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import CollegeCourseContent from "@/components/page/college/assets/CollegeCourseContent";
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

const getCollegeData = async (collegeId: number) => {
  const data = await getCollegeInfrastructure(collegeId);
  if (!data?.infrastructure) return null;
  return data;
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
    const college = await getCollegeData(collegeId);

    if (!college) {
      return generateErrorMetadata("not-found", "college");
    }

    const { college_information, infrastructure } = college;
    const content = infrastructure?.content?.[0];

    // Use the unified metadata generator (using generic tab since facilities isn't a standard tab)
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
          title: content?.title,
          meta_desc: content?.meta_desc,
          seo_param: content?.seo_param,
        },
      },
      content: content?.description,
    });
  } catch {
    return generateErrorMetadata("error", "college");
  }
}

export const revalidate = 43200; // 12 hours (revalidationTimes.collegeSub)

const CollegeFacilities = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const params = await props.params;
  const { "slug-id": slugId } = params;
  const parsed = parseSlugId(slugId);
  if (!parsed) return notFound();

  const { collegeId } = parsed;
  const facilitiesData = await getCollegeData(collegeId);
  if (!facilitiesData) {
    return notFound();
  }

  const { college_information, infrastructure, news_section } = facilitiesData;

  const baseSlug = college_information.slug?.replace(/(?:-\d+)+$/, "") || "";
  const correctSlugId = `${baseSlug}-${collegeId}`;
  if (slugId !== correctSlugId) {
    redirect(`/colleges/${correctSlugId}/facilities`);
  }

  const hasFacilityData =
    infrastructure.content.length > 0 ||
    infrastructure.hostel_and_campus.length > 0 ||
    infrastructure.college_gallery.length > 0 ||
    infrastructure.college_video.length > 0;

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
    tab: "facilities",
    tabLabel: "Facilities",
    tabPath: "/facilities",
  });

  // Build breadcrumb trail
  const breadcrumbItems = buildCollegeBreadcrumbTrail(
    college_information.college_name,
    correctSlugId,
    "generic" as any,
  );

  // Override the last breadcrumb to say "Facilities"
  if (breadcrumbItems.length > 0) {
    breadcrumbItems[breadcrumbItems.length - 1] = {
      name: "Facilities",
      href: `/colleges/${correctSlugId}/facilities`,
      current: true,
    };
  }

  const extractedData = {
    college_id: college_information.college_id,
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city,
    state: college_information.state,
    title: infrastructure?.content?.[0]?.title,
    location: college_information.location,
    college_brochure: college_information.college_brochure || "/",
  };

  return (
    <>
      <JsonLd data={schema} id="college-facilities-schema" />
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
            content={infrastructure.content}
            news={news_section}
          />
          <RatingComponent />
          {!hasFacilityData && (
            <div className="article-content-body">
              <h3 className="content-title mb-4">Facilities Information</h3>
              <p>No detailed facility information is currently available.</p>
            </div>
          )}
          {infrastructure.hostel_and_campus.length > 0 && (
            <div className="article-content-body">
              <h3 className="content-title mb-4">Hostel and Campus</h3>
              <p>Details coming soon.</p>
            </div>
          )}
          {infrastructure.college_gallery.length > 0 && (
            <div className="article-content-body">
              <h3 className="content-title mb-4">Gallery</h3>
              <p>Gallery images coming soon.</p>
            </div>
          )}
          {infrastructure.college_video.length > 0 && (
            <div className="article-content-body">
              <h3 className="content-title mb-4">Videos</h3>
              <p>Videos coming soon.</p>
            </div>
          )}
        </div>
        <div className="col-span-1 mt-4">
          <Image src="/ads/static.svg" height={250} width={500} alt="ads" />
          <CollegeNews news={news_section} clgSlug={correctSlugId} />
        </div>
      </section>
    </>
  );
};

export default CollegeFacilities;
