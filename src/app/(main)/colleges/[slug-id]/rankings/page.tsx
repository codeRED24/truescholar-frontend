import { getCollegeRankings } from "@/api/individual/getIndividualCollege";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import "@/app/styles/tables.css";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import CollegeCourseContent from "@/components/page/college/assets/CollegeCourseContent";
import CollegeRankingTable from "@/components/page/college/assets/CollegeRankingTable";
import Image from "next/image";
import CollegeNews from "@/components/page/college/assets/CollegeNews";
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
  const data = await getCollegeRankings(collegeId);
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
        title: "College Rankings Not Available | TrueScholar",
        description:
          "Ranking information for this college is currently not available. Explore other colleges and their rankings on TrueScholar.",
        robots: { index: false, follow: true },
      };

    const { college_information } = college;
    const collegeName = college_information.college_name || "College Rankings";

    const location =
      college_information.city && college_information.state
        ? `${college_information.city}, ${college_information.state}`
        : college_information.city || college_information.state || "";

    const baseSlug = college_information.slug?.replace(/(?:-\d+)+$/, "") || "";
    const canonicalUrl = `${BASE_URL}/colleges/${baseSlug}-${collegeId}/rankings`;

    // Create SEO-optimized title with location and keywords
    const defaultTitle = location
      ? `${collegeName} Rankings ${dayjs().year()} - ${location} | NIRF, QS, Times | TrueScholar`
      : `${collegeName} Rankings ${dayjs().year()} | NIRF, QS, Times Ranking | TrueScholar`;

    const metaDesc = `Check ${collegeName} rankings ${dayjs().year()} across NIRF, QS World University Rankings, Times Higher Education, and other prestigious ranking systems. Compare rankings for ${collegeName}${
      location ? ` in ${location}` : ""
    }.`;

    const ogImage = college_information.logo_img || `${BASE_URL}/og-image.png`;

    return {
      title: defaultTitle,
      description: college_information.metadesc || metaDesc,
      keywords: `${collegeName} ranking, ${collegeName} NIRF ranking, ${collegeName} QS ranking, college rankings India, NIRF 2025, QS World University Rankings${
        location ? `, ${location} college rankings` : ""
      }`,
      robots: {
        index: true,
        follow: true,
      },
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: defaultTitle,
        description: metaDesc,
        url: canonicalUrl,
        type: "website",
        siteName: "TrueScholar",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${collegeName} Rankings`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: defaultTitle,
        description: metaDesc,
        images: [ogImage],
      },
    };
  } catch (error) {
    return {
      title: "Error Loading College Rankings | TrueScholar",
      description:
        "We encountered an error while loading ranking information. Please try again later or browse other college pages on TrueScholar.",
      robots: { index: false, follow: true },
    };
  }
}

const CollegeRankings = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const params = await props.params;
  const { "slug-id": slugId } = params;
  const parsed = parseSlugId(slugId);
  if (!parsed) return notFound();

  const { collegeId } = parsed;
  const rankingsData = await getCollegeData(collegeId);
  if (!rankingsData) return notFound();

  const { college_information, rankings, news_section } = rankingsData;
  const baseSlug = college_information.slug?.replace(/(?:-\d+)+$/, "") || "";
  const correctSlugId = `${baseSlug}-${collegeId}`;

  if (slugId !== correctSlugId) {
    redirect(`/colleges/${correctSlugId}/rankings`);
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
  ];

  const extractedData = {
    college_id: college_information.college_id,
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city || "-",
    state: college_information.state || "-",
    title: rankings?.content?.[0]?.title,
    college_brochure: college_information.college_brochure || "/",
    location: college_information.location,
  };

  return (
    <>
      <Script
        id="college-rankings-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
      />
      <CollegeHead data={extractedData} />
      <CollegeNav data={college_information} />
      <section className="container-body md:grid grid-cols-4 gap-4 py-4">
        <div className="col-span-3 order-none md:order-1">
          <CollegeCourseContent
            content={rankings.content}
            news={news_section}
          />
          <CollegeRankingTable data={rankings} />
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

export default CollegeRankings;
