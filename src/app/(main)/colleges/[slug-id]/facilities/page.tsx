import { getCollegeInfrastructure } from "@/api/individual/getIndividualCollege";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import "@/app/styles/tables.css";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import CollegeCourseContent from "@/components/page/college/assets/CollegeCourseContent";
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
  const data = await getCollegeInfrastructure(collegeId);
  if (!data?.infrastructure) return null;
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
        title: "College Facilities Information Not Available | TrueScholar",
        description:
          "Facilities information for this college is currently not available. Explore other colleges and their campus infrastructure on TrueScholar.",
        robots: { index: false, follow: true },
      };

    const { college_information } = college;
    const collegeName =
      college_information.college_name || "College Facilities";

    const location =
      college_information.city && college_information.state
        ? `${college_information.city}, ${college_information.state}`
        : college_information.city || college_information.state || "";

    const baseSlug = college_information.slug?.replace(/(?:-\d+)+$/, "") || "";
    const canonicalUrl = `${BASE_URL}/colleges/${baseSlug}-${collegeId}/facilities`;

    // Create SEO-optimized title with location and keywords
    const defaultTitle = location
      ? `${collegeName} Facilities ${dayjs().year()} - ${location} | Hostel, Campus, Infrastructure | TrueScholar`
      : `${collegeName} Facilities ${dayjs().year()} | Hostel, Campus, Labs, Sports | TrueScholar`;

    const metaDesc = `Explore comprehensive ${collegeName} facilities including modern classrooms, well-equipped labs, hostel accommodations, sports facilities, library, and campus infrastructure. Get detailed information about campus amenities and student facilities at ${collegeName}${
      location ? ` in ${location}` : ""
    }.`;

    const ogImage = college_information.logo_img || `${BASE_URL}/og-image.png`;

    return {
      title: defaultTitle,
      description: metaDesc,
      keywords: `${collegeName} facilities, ${collegeName} hostel, ${collegeName} campus, ${collegeName} infrastructure, ${collegeName} labs, college facilities India${
        location ? `, ${location} college facilities` : ""
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
            alt: `${collegeName} Facilities`,
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
    console.error("Error generating metadata:", error);
    return {
      title: "Error Loading College Facilities | TrueScholar",
      description:
        "We encountered an error while loading facilities information. Please try again later or browse other college pages on TrueScholar.",
      robots: { index: false, follow: true },
    };
  }
}

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

  const jsonLD = [
    generateJSONLD("CollegeOrUniversity", {
      name: college_information.college_name,
      logo: college_information.logo_img,
      url: college_information.college_website,
      email: college_information.college_email,
      telephone: college_information.college_phone,
      address: college_information.location,
      additionalProperty: hasFacilityData
        ? {
            "@type": "PropertyValue",
            name: "Facilities",
            value: "Hostels, Campus Infrastructure, Gallery, Videos",
          }
        : undefined,
    }),
  ];

  const extractedData = {
    college_id: college_information.college_id,
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city,
    state: college_information.state,
    title: infrastructure?.[0]?.title,
    location: college_information.location,
    college_brochure: college_information.college_brochure || "/",
  };

  return (
    <>
      <Script
        id="college-facilities-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
      />
      <CollegeHead data={extractedData} />
      <CollegeNav data={college_information} />
      <section className="container-body md:grid grid-cols-4 gap-4 py-4">
        <div className="col-span-3 order-0 md:order-1">
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
              {/* Add custom rendering for hostel_and_campus if needed */}
              <p>Details coming soon.</p>
            </div>
          )}
          {infrastructure.college_gallery.length > 0 && (
            <div className="article-content-body">
              <h3 className="content-title mb-4">Gallery</h3>
              {/* Add gallery rendering logic here */}
              <p>Gallery images coming soon.</p>
            </div>
          )}
          {infrastructure.college_video.length > 0 && (
            <div className="article-content-body">
              <h3 className="content-title mb-4">Videos</h3>
              {/* Add video rendering logic here */}
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
