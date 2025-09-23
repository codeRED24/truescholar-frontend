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
import Image from "next/image";
import RatingComponent from "@/components/miscellaneous/RatingComponent";
import dayjs from "dayjs";
import dynamic from "next/dynamic";

const CollegeNews = dynamic(
  () => import("@/components/page/college/assets/CollegeNews")
);

const CutoffTable = dynamic(
  () => import("@/components/page/college/assets/CutoffTable")
);

const CutoffDatesTable = dynamic(
  () => import("@/components/page/college/assets/CutoffDatesTable")
);

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
  robots?: { index: boolean; follow: boolean };
  alternates?: object;
  openGraph?: object;
  twitter?: object;
}> {
  try {
    const params = await props.params;
    const slugId = params["slug-id"];
    const parsed = parseSlugId(slugId);
    if (!parsed)
      return {
        title: "College Not Found | TrueScholar",
        description:
          "The requested college page could not be found. Browse our comprehensive database of colleges in India to find the right institution for your education.",
        robots: { index: false, follow: true },
      };

    const { collegeId } = parsed;
    const college = await getCollegeData(collegeId);
    if (!college)
      return {
        title: "College Cutoff Information Not Available | TrueScholar",
        description:
          "Cutoff information for this college is currently not available. Explore other colleges and their admission cutoffs on TrueScholar.",
        robots: { index: false, follow: true },
      };

    const { college_information, cutoff_content } = college;
    const collegeName = college_information.college_name || "College Cutoffs";

    const location =
      college_information.city && college_information.state
        ? `${college_information.city}, ${college_information.state}`
        : college_information.city || college_information.state || "";

    const baseSlug = college_information.slug?.replace(/(?:-\d+)+$/, "") || "";
    const canonicalUrl = `${BASE_URL}/colleges/${baseSlug}-${collegeId}/cutoffs`;

    // Create SEO-optimized title with location and keywords
    const defaultTitle = location
      ? `${collegeName} Cutoffs ${dayjs().year()} - ${location} | TrueScholar`
      : `${collegeName} Cutoffs ${dayjs().year()} | TrueScholar`;

    const metaDesc =
      cutoff_content?.[0]?.meta_desc ||
      `Check ${collegeName} cutoffs ${dayjs().year()} for various courses including JEE Mains, NEET, and other entrance exams. Get detailed cutoff trends, opening and closing ranks, category-wise cutoffs, and admission criteria for ${collegeName}${
        location ? ` in ${location}` : ""
      }`;

    const ogImage = college_information.logo_img || `${BASE_URL}/og-image.png`;

    return {
      title: cutoff_content?.[0]?.title || defaultTitle,
      description: metaDesc,
      keywords:
        cutoff_content?.[0]?.seo_param ||
        `${collegeName} cutoffs, ${collegeName} JEE cutoff, ${collegeName} NEET cutoff, ${collegeName} entrance exam cutoff, college cutoffs India${
          location ? `, ${location} college cutoffs` : ""
        }`,
      robots: {
        index: true,
        follow: true,
      },
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: cutoff_content?.[0]?.title || defaultTitle,
        description: metaDesc,
        url: canonicalUrl,
        type: "website",
        siteName: "TrueScholar",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${collegeName} Cutoffs`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: cutoff_content?.[0]?.title || defaultTitle,
        description: metaDesc,
        images: [ogImage],
      },
    };
  } catch (error) {
    return {
      title: "Error Loading College Cutoffs | TrueScholar",
      description:
        "We encountered an error while loading cutoff information. Please try again later or browse other college pages on TrueScholar.",
      robots: { index: false, follow: true },
    };
  }
}

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

  const jsonLD: object[] = [
    generateJSONLD("CollegeOrUniversity", {
      name: college_information.college_name,
      logo: college_information.logo_img,
      url: college_information.college_website,
      email: college_information.college_email,
      telephone: college_information.college_phone,
      address: college_information.location,
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
      <Script
        id="college-cutoffs-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
      />
      <CollegeHead data={extractedData} />
      <CollegeNav data={college_information} />
      <section className="container-body md:grid grid-cols-4 gap-4 py-4">
        <div className="col-span-3 order-none md:order-1">
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
