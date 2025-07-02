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

    const { college_information, scholarship_section } = college;
    const collegeName =
      college_information.college_name || "College Scholarships";
    const canonicalUrl = `${BASE_URL}/colleges/${college_information.slug}-${collegeId}/scholarships`;
    const metaDesc =
      scholarship_section?.[0]?.meta_desc ||
      "Explore scholarship opportunities at this college.";

    return {
      title: scholarship_section?.[0]?.title || `${collegeName} Scholarships`,
      description: metaDesc,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: scholarship_section?.[0]?.title || `${collegeName} Scholarships`,
        description: metaDesc,
        url: canonicalUrl,
      },
    };
  } catch (error) {
    return { title: "Error Loading College Data" };
  }
}

const CollegeScholarship = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  try {
    const params = await props.params;
    const { "slug-id": slugId } = params;
    const parsed = parseSlugId(slugId);
    if (!parsed) return notFound();

    const { collegeId } = parsed;
    const scholarshipData = await getCollegeData(collegeId);
    if (!scholarshipData) return notFound();

    const { college_information, scholarship_section, news_section } =
      scholarshipData;
    const correctSlugId = `${college_information.slug}`;

    console.log(slugId !== correctSlugId);

    // if (slugId !== correctSlugId) {
    //   redirect(`/colleges/${correctSlugId}/scholarships`);
    // }

    const jsonLD = [
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
            name: "Scholarships",
            item: `${BASE_URL}/colleges/${correctSlugId}/scholarships`,
          },
        ],
      }),
      generateJSONLD("Scholarship", {
        name: scholarship_section?.[0]?.title,
        provider: {
          "@type": "CollegeOrUniversity",
          name: college_information.college_name,
        },
        description: scholarship_section?.[0]?.meta_desc,
        url: `${BASE_URL}/colleges/${correctSlugId}/scholarships`,
      }),
    ];

    const extractedData = {
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
          <div className="col-span-3 order-none md:order-1">
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
  } catch (error) {
    console.log(error);

    return notFound();
  }
};

export default CollegeScholarship;
