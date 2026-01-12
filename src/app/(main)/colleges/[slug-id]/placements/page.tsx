import { getCollegePlacementProcess } from "@/api/individual/getIndividualCollege";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import "@/app/styles/tables.css";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import Image from "next/image";
import dayjs from "dayjs";
import dynamic from "next/dynamic";

const RatingComponent = dynamic(
  () => import("@/components/miscellaneous/RatingComponent")
);

const CollegeNews = dynamic(
  () => import("@/components/page/college/assets/CollegeNews")
);

const CollegePlacementData = dynamic(
  () => import("@/components/page/college/assets/CollegePlacementData")
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
  const data = await getCollegePlacementProcess(collegeId);
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
        title: "College Placement Information Not Available | TrueScholar",
        description:
          "Placement information for this college is currently not available. Explore other colleges and their placement records on TrueScholar.",
        robots: { index: false, follow: true },
      };

    const { college_information, placement_process } = college;

    const collegeName =
      college_information?.college_name || "College Placements";

    const location =
      college_information.city && college_information.state
        ? `${college_information.city}, ${college_information.state}`
        : college_information.city || college_information.state || "";

    const baseSlug = college_information.slug?.replace(/(?:-\d+)+$/, "") || "";
    const canonicalUrl = `${BASE_URL}/colleges/${baseSlug}-${collegeId}/placements`;

    // Create SEO-optimized title with location and keywords
    const defaultTitle = location
      ? `${collegeName} Placements ${dayjs().year()} - ${location} | Salary, Companies | TrueScholar`
      : `${collegeName} Placements ${dayjs().year()} | Salary, Companies, Records | TrueScholar`;

    const metaDesc =
      placement_process.content[0]?.meta_desc ||
      `Check ${collegeName} placement records ${dayjs().year()} including highest salary, average salary, top recruiting companies, and placement statistics. Get detailed placement reports, company visits, and career opportunities for ${collegeName}${
        location ? ` in ${location}` : ""
      }`;

    const ogImage = college_information.logo_img || `${BASE_URL}/og-image.png`;

    return {
      title: placement_process.content[0]?.title || defaultTitle,
      description: metaDesc,
      keywords:
        placement_process.content[0]?.seo_param ||
        `${collegeName} placements, ${collegeName} placement records, ${collegeName} salary, ${collegeName} companies, college placements India, placement statistics${
          location ? `, ${location} placements` : ""
        }`,
      robots: {
        index: true,
        follow: true,
      },
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: placement_process.content[0]?.title || defaultTitle,
        description: metaDesc,
        url: canonicalUrl,
        type: "website",
        siteName: "TrueScholar",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${collegeName} Placements`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: placement_process.content[0]?.title || defaultTitle,
        description: metaDesc,
        images: [ogImage],
      },
    };
  } catch (error) {
    return {
      title: "Error Loading College Placements | TrueScholar",
      description:
        "We encountered an error while loading placement information. Please try again later or browse other college pages on TrueScholar.",
      robots: { index: false, follow: true },
    };
  }
}

const CollegePlacement = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const params = await props.params;
  const { "slug-id": slugId } = params;
  const parsed = parseSlugId(slugId);
  if (!parsed) {
    return notFound();
  }

  const { collegeId } = parsed;

  const placementData = await getCollegeData(collegeId);

  if (!placementData) {
    return notFound();
  }

  const { college_information, placement_process, news_section } =
    placementData;
  const baseSlug = college_information.slug?.replace(/(?:-\d+)+$/, "") || "";
  const correctSlugId = `${baseSlug}-${collegeId}`;

  if (slugId !== correctSlugId) {
    redirect(`/colleges/${correctSlugId}/placements`);
  }

  const jsonLD = [
    generateJSONLD("CollegeOrUniversity", {
      name: college_information.college_name,
      logo: college_information.logo_img,
      url: college_information.college_website,
      email: college_information.college_email,
      telephone: college_information.college_phone,
      address: college_information.location,
    }),
    // generateJSONLD("JobPosting", {
    //   title: "Various Roles at IIT Madras Placements",
    //   hiringOrganization: {
    //     "@type": "Organization",
    //     name: college_information.college_name,
    //   },
    //   employmentType: "FULL_TIME",
    //   baseSalary: {
    //     "@type": "MonetaryAmount",
    //     currency: "INR",
    //     value: {
    //       "@type": "QuantitativeValue",
    //       minValue: placement_process.placements?.[0]?.highest_package || 0,
    //       maxValue: placement_process.placements?.[1]?.highest_package || 0,
    //       unitText: "YEAR",
    //     },
    //   },
    //   datePosted: placement_process.content[0]?.updated_at,
    //   jobLocation: {
    //     "@type": "Place",
    //     address: college_information.location,
    //   },
    // }),
  ];

  const extractedData = {
    college_id: college_information.college_id,
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city,
    state: college_information.state,
    college_brochure: college_information.college_brochure || "/",
    title: placement_process.content[0]?.title,
    location: college_information.location,
  };

  return (
    <>
      <Script
        id="college-placement-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
      />
      <CollegeHead data={extractedData} />
      <CollegeNav data={college_information} />
      <section className="container-body md:grid grid-cols-4 gap-4 py-4">
        <div className="col-span-3 order-0 md:order-1">
          <CollegePlacementData
            clg={college_information.college_name}
            content={placement_process.content}
            summaryData={placementData.placement_process?.placements}
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

export default CollegePlacement;
