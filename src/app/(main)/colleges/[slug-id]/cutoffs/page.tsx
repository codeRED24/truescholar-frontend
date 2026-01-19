import {
  getCollegeCutoffs,
  getCollegeCutoffsData,
} from "@/api/individual/getIndividualCollege";
import { notFound, redirect } from "next/navigation";
import "@/app/styles/tables.css";
import CollegeCourseContent from "@/components/page/college/assets/CollegeCourseContent";
import { CollegeDateDTO } from "@/api/@types/college-info";
import Image from "next/image";
import RatingComponent from "@/components/miscellaneous/RatingComponent";
import dynamic from "next/dynamic";
import {
  generatePageMetadata,
  generatePageSchema,
  generateErrorMetadata,
  JsonLd,
  buildCollegeBreadcrumbTrail,
} from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo";

const CollegeNews = dynamic(
  () => import("@/components/page/college/assets/CollegeNews"),
);

const CutoffTable = dynamic(
  () => import("@/components/page/college/assets/CutoffTable"),
);

const CutoffDatesTable = dynamic(
  () => import("@/components/page/college/assets/CutoffDatesTable"),
);

const CollegeNav = dynamic(
  () => import("@/components/page/college/assets/CollegeNav"),
);

const CollegeHead = dynamic(
  () => import("@/components/page/college/assets/CollegeHead"),
);

const parseSlugId = (slugId: string) => {
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return null;
  const collegeId = Number(match[2]);
  return isNaN(collegeId) ? null : { collegeId, slug: match[1] };
};

const getCollegeData = async (collegeId: number) => {
  const data = await getCollegeCutoffs(collegeId);
  if (!data) return null;
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

    const { college_information, cutoff_content } = college;

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
        tab: "cutoffs",
        tabContent: {
          title: cutoff_content?.[0]?.title,
          meta_desc: cutoff_content?.[0]?.meta_desc,
          seo_param: cutoff_content?.[0]?.seo_param,
        },
      },
      content: cutoff_content?.[0]?.description,
    });
  } catch {
    return generateErrorMetadata("error", "college");
  }
}

export const revalidate = 43200; // 12 hours (revalidationTimes.collegeSub)

const CollegeCutoffs = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const params = await props.params;
  const { "slug-id": slugId } = params;
  const parsed = parseSlugId(slugId);
  if (!parsed) return notFound();

  const { collegeId } = parsed;
  const cutoffData = await getCollegeData(collegeId);
  if (!cutoffData) return notFound();

  const { college_information, cutoff_content, news_section, college_dates } =
    cutoffData;

  const cutoffDataVal = await getCollegeCutoffsData(collegeId);

  if (
    !cutoffData?.college_information?.dynamic_fields?.cutoff &&
    !cutoffData?.college_information?.additional_fields.college_cutoff_present
  )
    return notFound();

  const cutoffVal = cutoffDataVal?.cutoffs_data?.grouped_by_exam;

  const baseSlug = college_information.slug?.replace(/(?:-\d+)+$/, "") || "";
  const correctSlugId = `${baseSlug}-${collegeId}`;

  if (slugId !== correctSlugId) {
    redirect(`/colleges/${correctSlugId}/cutoffs`);
  }

  // Transform dates for schema generation
  const datesForSchema =
    college_dates?.map((date: CollegeDateDTO) => ({
      event: date.event,
      start_date: date.start_date,
      end_date: date.end_date,
      is_confirmed: date.is_confirmed,
    })) || [];

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
    tab: "cutoffs",
    tabLabel: "Cutoffs",
    tabPath: "/cutoffs",
    dates: datesForSchema,
  });

  // Build breadcrumb trail
  const breadcrumbItems = buildCollegeBreadcrumbTrail(
    college_information.college_name,
    correctSlugId,
    "cutoffs",
  );

  const extractedData = {
    college_id: college_information.college_id,
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city,
    state: college_information.state,
    title: cutoff_content?.[0]?.title,
    location: college_information.location,
    college_brochure: college_information.college_brochure || "/",
  };

  return (
    <>
      <JsonLd data={schema} id="college-cutoffs-schema" />
      <CollegeHead data={extractedData} />
      <CollegeNav data={college_information} />
      <section className="container-body md:grid grid-cols-4 gap-4 py-4">
        <div className="col-span-3 order-0 md:order-1">
          <Breadcrumbs
            items={breadcrumbItems}
            className="mb-4"
            showSchema={false}
          />
          <CollegeCourseContent content={cutoff_content} news={news_section} />
          <CutoffTable data={cutoffVal} collegeId={collegeId} />
          {college_dates?.length > 0 && (
            <CutoffDatesTable data={college_dates} />
          )}
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

export default CollegeCutoffs;
