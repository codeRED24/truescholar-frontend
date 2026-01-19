import { getCollegeAdmissionProcess } from "@/api/individual/getIndividualCollege";
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
  const data = await getCollegeAdmissionProcess(collegeId);
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

    const { college_information, admission_process } = college;
    const content = admission_process?.content?.[0];

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
        tab: "admission-process",
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

const CollegeAdmissionProcess = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const params = await props.params;
  const { "slug-id": slugId } = params;

  const parsed = parseSlugId(slugId);
  if (!parsed) return notFound();

  const { collegeId } = parsed;
  const admissionData = await getCollegeData(collegeId);
  if (!admissionData) return notFound();

  const { college_information, admission_process, news_section } =
    admissionData;
  const baseSlug = college_information.slug?.replace(/(?:-\d+)+$/, "") || "";
  const correctSlugId = `${baseSlug}-${collegeId}`;

  if (slugId !== correctSlugId) {
    redirect(`/colleges/${correctSlugId}/admission-process`);
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
    tab: "admission-process",
    tabLabel: "Admission Process",
    tabPath: "/admission-process",
  });

  // Build breadcrumb trail
  const breadcrumbItems = buildCollegeBreadcrumbTrail(
    college_information.college_name,
    correctSlugId,
    "admission-process",
  );

  const extractedData = {
    college_id: college_information.college_id,
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city,
    state: college_information.state,
    title: admission_process?.content?.[0]?.title,
    location: college_information.location,
    college_brochure: college_information.college_brochure || "/",
  };

  return (
    <>
      <JsonLd data={schema} id="college-admission-schema" />
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
            content={admission_process?.content}
            news={news_section}
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

export default CollegeAdmissionProcess;
