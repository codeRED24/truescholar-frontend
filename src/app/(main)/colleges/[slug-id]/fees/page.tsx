import { notFound, redirect } from "next/navigation";
import { getCollegeFees } from "@/api/individual/getIndividualCollege";
import { CollegeDTO } from "@/api/@types/college-info";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeFeesContent from "@/components/page/college/assets/CollegeFeesContent";
import "@/app/styles/tables.css";
import CollegeFeesData from "@/components/page/college/assets/CollegeFeesData";
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
    const college = await getCollegeFees(collegeId);

    if (!college) {
      return generateErrorMetadata("not-found", "college");
    }

    const { college_information, fees_section } = college;
    const content = fees_section?.content?.[0];

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
        tab: "fees",
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

const CollegeFees = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const params = await props.params;
  const { "slug-id": slugId } = params;
  const parsed = parseSlugId(slugId);
  if (!parsed) return notFound();

  const { collegeId } = parsed;
  const collegeFeesData: CollegeDTO = await getCollegeFees(collegeId);
  const { college_information, news_section, fees_section } = collegeFeesData;

  if (
    !college_information?.dynamic_fields?.fees &&
    !college_information?.additional_fields?.college_wise_fees_present
  ) {
    return notFound();
  }

  const baseSlug = (college_information.slug || "default-college")
    .replace(/(?:-\d+)+$/, "")
    .toLowerCase();
  const correctSlugId = `${baseSlug}-${collegeId}`;

  if (slugId !== correctSlugId) {
    redirect(`/colleges/${correctSlugId}/fees`);
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
    tab: "fees",
    tabLabel: "Fees",
    tabPath: "/fees",
  });

  // Build breadcrumb trail
  const breadcrumbItems = buildCollegeBreadcrumbTrail(
    college_information.college_name,
    correctSlugId,
    "fees",
  );

  const extractedData = {
    college_id: college_information.college_id,
    college_name: college_information?.college_name || "",
    college_logo: college_information?.logo_img || "",
    city: college_information?.city || "",
    state: college_information?.state || "",
    location: college_information?.location || "",
    title: fees_section?.content?.[0]?.title || "",
    college_brochure: college_information?.college_brochure || "/",
  };

  return (
    <>
      <JsonLd data={schema} id="college-fees-schema" />
      <CollegeHead data={extractedData} />
      <CollegeNav data={college_information} />
      <section className="container-body md:grid grid-cols-4 gap-4 py-4">
        <div className="col-span-3 order-0 md:order-1">
          <Breadcrumbs
            items={breadcrumbItems}
            className="mb-4"
            showSchema={false}
          />
          <CollegeFeesContent
            content={fees_section?.content || []}
            news={news_section}
          />
          <CollegeFeesData data={fees_section?.fees} />
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

export default CollegeFees;
