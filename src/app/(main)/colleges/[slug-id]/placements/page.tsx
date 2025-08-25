import { getCollegePlacementProcess } from "@/api/individual/getIndividualCollege";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import "@/app/styles/tables.css";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import CollegePlacementData from "@/components/page/college/assets/CollegePlacementData";
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

    const { college_information, placement_process } = college;
    const collegeName = college_information?.college_name;
    const canonicalUrl = `${BASE_URL}/colleges/${college_information.slug}-${collegeId}/placements`;
    const metaDesc =
      placement_process.content[0]?.meta_desc ||
      "Explore placement records and opportunities at this college.";

    return {
      title: placement_process.content[0]?.title || `${collegeName} Placements`,
      description: metaDesc,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title:
          placement_process.content[0]?.title || `${collegeName} Placements`,
        description: metaDesc,
        url: canonicalUrl,
      },
    };
  } catch (error) {
    return { title: "Error Loading College Data" };
  }
}

const CollegePlacement = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  try {
    const params = await props.params;
    const { "slug-id": slugId } = params;
    const parsed = parseSlugId(slugId);
    if (!parsed) return notFound();

    const { collegeId } = parsed;
    const placementData = await getCollegeData(collegeId);
    if (!placementData) return notFound();

    const { college_information, placement_process, news_section } =
      placementData;
    const correctSlugId = `${college_information.slug}`;

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
          <div className="col-span-3 order-none md:order-1">
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
  } catch (error) {
    console.log(error);

    // return notFound();
  }
};

export default CollegePlacement;
