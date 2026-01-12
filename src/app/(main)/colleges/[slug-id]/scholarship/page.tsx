import { getCollegeScholarshipById } from "@/api/individual/getIndividualCollege";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import "@/app/styles/tables.css";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import CollegeCourseContent from "@/components/page/college/assets/CollegeCourseContent";
import CollegeNews from "@/components/page/college/assets/CollegeNews";
import Image from "next/image";
import RatingComponent from "@/components/miscellaneous/RatingComponent";
import dayjs from "dayjs";

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
  const data = await getCollegeScholarshipById(collegeId);
  if (!data?.scholarship_section?.length) return null;
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
        title: "College Scholarships Not Available | TrueScholar",
        description:
          "Scholarship information for this college is currently not available. Explore other colleges and their scholarship opportunities on TrueScholar.",
        robots: { index: false, follow: true },
      };

    const { college_information, scholarship_section } = college;

    const collegeName =
      college_information.college_name || "College Scholarships";

    const location =
      college_information.city ||
      college_information.state ||
      college_information.location ||
      "";

    const baseSlug = college_information.slug?.replace(/(?:-\d+)+$/, "") || "";
    const correctSlugId = `${baseSlug}-${collegeId}`;

    const canonicalUrl = `${BASE_URL}/colleges/${correctSlugId}/scholarship`;
    const metaDesc =
      scholarship_section?.[0]?.meta_desc ||
      `Apply for ${collegeName} scholarships ${dayjs().year()}. Check eligibility criteria, application process, and deadlines for financial aid programs. Get complete scholarship details, amounts, and requirements for students at ${collegeName}${
        location ? ` in ${location}` : ""
      }.`;

    const ogImage = college_information.logo_img || `${BASE_URL}/og-image.png`;

    // Create SEO-optimized title with location and keywords
    const defaultTitle = location
      ? `${collegeName} Scholarships ${dayjs().year()} - ${location} | TrueScholar`
      : `${collegeName} Scholarships ${dayjs().year()} | Eligibility & Application | TrueScholar`;

    return {
      title: scholarship_section?.[0]?.title || defaultTitle,
      description: metaDesc,
      keywords:
        scholarship_section?.[0]?.seo_param ||
        `${collegeName} scholarship, ${collegeName} financial aid, scholarship eligibility, college scholarships India${
          location ? `, ${location} scholarships` : ""
        }`,
      robots: {
        index: true,
        follow: true,
      },
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: scholarship_section?.[0]?.title || defaultTitle,
        description: metaDesc,
        url: canonicalUrl,
        type: "website",
        siteName: "TrueScholar",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${collegeName} Scholarships`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: scholarship_section?.[0]?.title || defaultTitle,
        description: metaDesc,
        images: [ogImage],
      },
    };
  } catch (error) {
    return {
      title: "Error Loading College Scholarships | TrueScholar",
      description:
        "We encountered an error while loading scholarship information. Please try again later or browse other college pages on TrueScholar.",
      robots: { index: false, follow: true },
    };
  }
}

const CollegeScholarship = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const params = await props.params;
  const { "slug-id": slugId } = params;
  const parsed = parseSlugId(slugId);
  if (!parsed) return notFound();

  const { collegeId } = parsed;
  const scholarshipData = await getCollegeData(collegeId);
  if (!scholarshipData) return notFound();

  const { college_information, scholarship_section, news_section } =
    scholarshipData;

  // Ensure the college slug doesn't already contain the college ID (strip one or more trailing -<digits> segments)
  const baseSlug = college_information.slug?.replace(/(?:-\d+)+$/, "") || "";
  const correctSlugId = `${baseSlug}-${collegeId}`;

  if (slugId !== correctSlugId) {
    redirect(`/colleges/${correctSlugId}/scholarship`);
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
    generateJSONLD("Scholarship", {
      name: scholarship_section?.[0]?.title,
      provider: {
        "@type": "CollegeOrUniversity",
        name: college_information.college_name,
      },
      description: scholarship_section?.[0]?.meta_desc,
      url: `${BASE_URL}/colleges/${correctSlugId}/scholarship`,
    }),
  ];

  const extractedData = {
    college_id: college_information.college_id,
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city,
    state: college_information.state,
    college_brochure: college_information.college_brochure || "/",
    title: scholarship_section?.[0]?.title,
    location: college_information.location,
  };

  return (
    <>
      <Script
        id="college-scholarship-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
      />
      <CollegeHead data={extractedData} />
      <CollegeNav data={college_information} />
      <section className="container-body md:grid grid-cols-4 gap-4 py-4">
        <div className="col-span-3 order-0 md:order-1">
          <CollegeCourseContent
            content={scholarship_section}
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

export default CollegeScholarship;
