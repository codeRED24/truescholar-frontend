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
    if (!college) return notFound();

    const { college_information } = college;
    const collegeName =
      college_information.college_name || "College Facilities";
    const canonicalUrl = `${BASE_URL}/colleges/${college_information.slug}-${collegeId}/facilities`;
    const metaDesc = `Explore the facilities at ${collegeName}, including hostels, campus infrastructure, and more.`;

    return {
      title: `${collegeName} Facilities`,
      description: metaDesc,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: `${collegeName} Facilities`,
        description: metaDesc,
        url: canonicalUrl,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return { title: "Error Loading College Data" };
  }
}

const CollegeFacilities = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  try {
    const params = await props.params;
    const { "slug-id": slugId } = params;
    const parsed = parseSlugId(slugId);
    if (!parsed) return notFound();

    const { collegeId } = parsed;
    const facilitiesData = await getCollegeData(collegeId);
    if (!facilitiesData) {
      return notFound();
    }

    const { college_information, infrastructure, news_section } =
      facilitiesData;
    const correctSlugId = `${college_information.slug}-${collegeId}`;

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
            name: "Facilities",
            item: `${BASE_URL}/colleges/${correctSlugId}/facilities`,
          },
        ],
      }),
    ];

    const extractedData = {
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
          <div className="col-span-3 order-none md:order-1">
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
  } catch (error) {
    return notFound();
  }
};

export default CollegeFacilities;
