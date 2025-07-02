import {
  getCollegeCutoffs,
  getCollegeCutoffsData,
} from "@/api/individual/getIndividualCollege";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import "@/app/styles/tables.css";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import CollegeCourseContent from "@/components/page/college/assets/CollegeCourseContent";
import { CollegeDateDTO } from "@/api/@types/college-info";
import CutoffDatesTable from "@/components/page/college/assets/CutoffDatesTable";
import Image from "next/image";
import CollegeNews from "@/components/page/college/assets/CollegeNews";
import RatingComponent from "@/components/miscellaneous/RatingComponent";
import CutoffTable from "@/components/page/college/assets/CutoffTable";

const BASE_URL = "https://www.truescholar.in";

const parseSlugId = (slugId: string) => {
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return null;
  const collegeId = Number(match[2]);
  return isNaN(collegeId) ? null : { collegeId, slug: match[1] };
};

const generateJSONLD = (type: string, data: object) => ({
  "@context": "https://schema.org",
  "@type": type,
  ...data,
});

const getCollegeData = async (collegeId: number) => {
  const data = await getCollegeCutoffs(collegeId);
  if (!data) return null;
  return data;
};

export async function generateMetadata(props: {
  params: Promise<{ "slug-id": string }>;
}): Promise<{
  title: string;
  description?: string;
  keywords?: string;
  alternates?: object;
  openGraph?: object;
}> {
  try {
    const params = await props.params;
    const slugId = params["slug-id"];
    const parsed = parseSlugId(slugId);
    if (!parsed) return { title: "College Not Found" };

    const { collegeId } = parsed;
    const college = await getCollegeData(collegeId);
    if (!college) return { title: "College Not Found" };

    const { college_information, cutoff_content } = college;
    const collegeName = college_information.college_name || "College Cutoffs";
    const canonicalUrl = `${BASE_URL}/colleges/${college_information.slug}-${collegeId}/cutoffs`;
    const metaDesc =
      cutoff_content?.[0]?.meta_desc ||
      "Find cutoff details and trends for this college.";

    return {
      title: cutoff_content?.[0]?.title || `${collegeName} Cutoffs`,
      description: metaDesc,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: cutoff_content?.[0]?.title || `${collegeName} Cutoffs`,
        description: metaDesc,
        url: canonicalUrl,
      },
    };
  } catch (error) {
    return { title: "Error Loading College Data" };
  }
}

const CollegeCutoffs = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  try {
    const params = await props.params;
    const { "slug-id": slugId } = params;
    const parsed = parseSlugId(slugId);
    if (!parsed) return notFound();

    const { collegeId } = parsed;
    const cutoffData = await getCollegeData(collegeId);
    if (!cutoffData) return notFound();

    const { college_information, cutoff_content, news_section, college_dates } =
      cutoffData;

    // Ensure the college slug doesn't already contain the college ID
    const baseSlug = college_information.slug?.replace(/-\d+$/, "") || "";
    const correctSlugId = `${baseSlug}-${collegeId}`;

    const cutoffDataVal = await getCollegeCutoffsData(collegeId);

    if (
      !cutoffData?.college_information?.dynamic_fields?.cutoff &&
      !cutoffData?.college_information?.additional_fields.college_cutoff_present
    )
      return notFound();

    const cutoffVal = cutoffDataVal?.cutoffs_data?.grouped_by_exam;

    if (slugId !== correctSlugId) {
      redirect(`/colleges/${correctSlugId}/cutoffs`);
    }

    const jsonLD: object[] = [
      generateJSONLD("CollegeOrUniversity", {
        name: college_information.college_name,
        logo: college_information.logo_img,
        url: college_information.college_website,
        email: college_information.college_email,
        telephone: college_information.college_phone,
        address: college_information.location,
      }),

      generateJSONLD("BreadcrumbList", {
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
            name: college_information.college_name,
            item: `${BASE_URL}/colleges/${correctSlugId}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: "Cutoffs",
            item: `${BASE_URL}/colleges/${correctSlugId}/cutoffs`,
          },
        ],
      }),
      ...college_dates.map((date: CollegeDateDTO, index: number) =>
        generateJSONLD("Event", {
          name: date.event,
          startDate: date.start_date,
          endDate: date.end_date,
          location: {
            "@type": "Place",
            name: college_information.college_name,
            address: college_information.location,
          },
          eventStatus: date.is_confirmed ? "EventScheduled" : "EventPostponed",
        })
      ),
    ];

    const extractedData = {
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
        <Script
          id="college-cutoffs-ld-json"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
        />
        <CollegeHead data={extractedData} />
        <CollegeNav data={college_information} />
        <section className="container-body md:grid grid-cols-4 gap-4 py-4">
          <div className="col-span-3 order-none md:order-1">
            <CollegeCourseContent
              content={cutoff_content}
              news={news_section}
            />
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
  } catch (error) {
    console.log(error);

    return notFound();
  }
};

export default CollegeCutoffs;
