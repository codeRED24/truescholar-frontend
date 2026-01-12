import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import { getCollegeFees } from "@/api/individual/getIndividualCollege";
import { CollegeDTO } from "@/api/@types/college-info";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeFeesContent from "@/components/page/college/assets/CollegeFeesContent";
import "@/app/styles/tables.css";
import CollegeFeesData from "@/components/page/college/assets/CollegeFeesData";
import Image from "next/image";
import CollegeNews from "@/components/page/college/assets/CollegeNews";
import RatingComponent from "@/components/miscellaneous/RatingComponent";
import dayjs from "dayjs";

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
  const params = await props.params;
  const slugId = params["slug-id"];
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match)
    return {
      title: "College Not Found | TrueScholar",
      description:
        "The requested college page could not be found. Browse our comprehensive database of colleges in India to find the right institution for your education.",
      robots: { index: false, follow: true },
    };

  const collegeId = Number(match[2]);
  if (isNaN(collegeId))
    return {
      title: "Invalid College ID | TrueScholar",
      description:
        "The college ID provided is invalid. Please check the URL and try again.",
      robots: { index: false, follow: true },
    };

  try {
    const college = await getCollegeFees(collegeId);
    if (!college)
      return {
        title: "College Fees Information Not Available | TrueScholar",
        description:
          "Fees information for this college is currently not available. Explore other colleges and their fee structures on TrueScholar.",
        robots: { index: false, follow: true },
      };

    const { college_information, fees_section } = college;
    const collegeName = college_information?.college_name || "College Fees";

    const location =
      college_information.city ||
      college_information.state ||
      college_information.location ||
      "";

    const collegeSlug = college_information?.slug.replace(/(?:-\d+)+$/, "");
    const canonicalUrl = `https://www.truescholar.in/colleges/${collegeSlug}-${collegeId}/fees`;
    const content = fees_section?.content?.[0] || {};

    // Create SEO-optimized title with location and keywords
    const defaultTitle = location
      ? `${collegeName} Fees ${dayjs().year()} - ${location} | Tuition, Hostel, Admission | TrueScholar`
      : `${collegeName} Fees ${dayjs().year()} | Tuition, Hostel, Admission Fees | TrueScholar`;

    const metaDesc =
      content.meta_desc ||
      `Check ${collegeName} fee structure ${dayjs().year()} including tuition fees, hostel fees, admission fees, and other charges. Get detailed breakdown of course-wise fees, payment options, and financial assistance for ${collegeName}${
        location ? ` in ${location}` : ""
      }.`;

    const ogImage =
      college_information.logo_img || "https://www.truescholar.in/og-image.png";

    return {
      title: content.title || defaultTitle,
      description: metaDesc,
      keywords:
        content.seo_param ||
        `${collegeName} fees, ${collegeName} tuition fees, ${collegeName} hostel fees, ${collegeName} admission fees, college fee structure India${
          location ? `, ${location} college fees` : ""
        }`,
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: content.title || defaultTitle,
        description: metaDesc,
        url: canonicalUrl,
        type: "website",
        siteName: "TrueScholar",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${collegeName} Fees`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: content.title || defaultTitle,
        description: metaDesc,
        images: [ogImage],
      },
    };
  } catch (error) {
    return {
      title: "Error Loading College Fees | TrueScholar",
      description:
        "We encountered an error while loading fee information. Please try again later or browse other college pages on TrueScholar.",
      robots: { index: false, follow: true },
    };
  }
}

const CollegeFees = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const params = await props.params;
  const { "slug-id": slugId } = params;
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return notFound();

  const collegeId = Number(match[2]);
  if (isNaN(collegeId)) return notFound();

  const collegeFeesData: CollegeDTO = await getCollegeFees(collegeId);
  const { college_information, news_section, fees_section } = collegeFeesData;

  if (
    !college_information?.dynamic_fields?.fees &&
    !college_information?.additional_fields?.college_wise_fees_present
  ) {
    return notFound();
  }

  const {
    slug,
    college_name,
    logo_img,
    college_website,
    college_email,
    college_phone,
    location,
  } = college_information;

  const trimmedSlug = (slug || "default-college")
    .replace(/(?:-\d+)+$/, "")
    .toLowerCase();
  const correctSlugId = `${trimmedSlug}-${collegeId}`;

  if (slugId !== correctSlugId) {
    redirect(`/colleges/${correctSlugId}/fees`);
  }

  const clgLD = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: college_name,
    logo: logo_img,
    url: college_website,
    email: college_email,
    telephone: college_phone,
    address: location,
  };

  const extractedData = {
    college_id: college_information.college_id,
    college_name: college_information?.college_name || "",
    college_logo: college_information?.logo_img || "",
    city: college_information?.city || "",
    state: college_information?.state || "",
    location: college_information?.location || "",
    title: fees_section?.content?.[0]?.title || "",
    college_brochure: college_information?.college_brochure || "/",
  };

  return (
    <>
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clgLD) }}
      />

      <CollegeHead data={extractedData} />
      <CollegeNav data={college_information} />

      <section className="container-body md:grid grid-cols-4 gap-4 py-4">
        <div className="col-span-3 order-0 md:order-1">
          <CollegeFeesContent
            content={fees_section?.content || []}
            news={news_section}
          />
          <CollegeFeesData data={fees_section?.fees} />
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

export default CollegeFees;
