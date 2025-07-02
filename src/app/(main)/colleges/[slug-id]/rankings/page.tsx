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
    if (!college) return { title: "Rankings Not Available" };

    const { college_information } = college;
    const collegeName = college_information.college_name || "College Rankings";
    const canonicalUrl = `${BASE_URL}/colleges/${college_information.slug}-${collegeId}/rankings`;
    const metaDesc = `Explore the latest rankings for ${collegeName}, including NIRF, QS, and other prestigious rankings.`;

    return {
      title: `${collegeName} Rankings`,
      description: metaDesc,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: `${collegeName} Rankings`,
        description: metaDesc,
        url: canonicalUrl,
      },
    };
  } catch (error) {
    return { title: "Error Loading College Data" };
  }
}

const CollegeRankings = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  try {
    const params = await props.params;
    const { "slug-id": slugId } = params;
    const parsed = parseSlugId(slugId);
    if (!parsed) return notFound();

    const { collegeId } = parsed;
    const rankingsData = await getCollegeData(collegeId);
    if (!rankingsData) return notFound();

    const { college_information, rankings, news_section } = rankingsData;
    const correctSlugId = `${college_information.slug}-${collegeId}`;

    // if (slugId !== correctSlugId) {
    //   redirect(`/colleges/${correctSlugId}/rankings`);
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
            name: "Rankings",
            item: `${BASE_URL}/colleges/${correctSlugId}/rankings`,
          },
        ],
      }),
    ];

    const extractedData = {
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
  } catch (error) {
    return notFound();
  }
};

export default CollegeRankings;
