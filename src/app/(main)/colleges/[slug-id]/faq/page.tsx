import { getCollegeFaq } from "@/api/individual/getIndividualCollege";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import "@/app/styles/tables.css";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import CollegeCourseContent from "@/components/page/college/assets/CollegeCourseContent";
import Image from "next/image";
import CollegeNews from "@/components/page/college/assets/CollegeNews";
import { parseFAQFromHTML } from "@/components/utils/parsefaqschema";

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
  const data = await getCollegeFaq(collegeId);
  if (!data?.faqData?.length) return null;
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
    if (!college) return { title: "FAQs Not Available" };

    const { college_information, faqData } = college;
    const collegeName = college_information.college_name || "College FAQs";

    const baseSlug = college_information.slug?.replace(/(?:-\d+)+$/, "") || "";
    const correctSlugId = `${baseSlug}-${collegeId}`;

    const canonicalUrl = `${BASE_URL}/colleges/${correctSlugId}/faq`;
    const metaDesc =
      faqData[0]?.meta_desc ||
      "Find answers to frequently asked questions about this college.";

    return {
      title: faqData[0]?.title || `${collegeName} FAQs`,
      description: metaDesc,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: faqData[0]?.title || `${collegeName} FAQs`,
        description: metaDesc,
        url: canonicalUrl,
      },
    };
  } catch (error) {
    return { title: "Error Loading College Data" };
  }
}

const CollegeFAQs = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const params = await props.params;
  const { "slug-id": slugId } = params;
  const parsed = parseSlugId(slugId);
  if (!parsed) {
    console.log("********");
    return notFound();
  }

  const { collegeId } = parsed;
  const faqDataa = await getCollegeData(collegeId);
  if (!faqDataa) {
    console.log("********");
    return notFound();
  }

  const { college_information, faqData, news_section } = faqDataa;

  const baseSlug = college_information.slug?.replace(/(?:-\d+)+$/, "") || "";
  const correctSlugId = `${baseSlug}-${collegeId}`;

  if (slugId !== correctSlugId) {
    redirect(`/colleges/${correctSlugId}/faq`);
  }

  // Parse FAQs from HTML content
  const parsedFAQs = parseFAQFromHTML(faqData[0]?.description || "");

  const jsonLD = [
    generateJSONLD("CollegeOrUniversity", {
      name: college_information.college_name,
      logo: college_information.logo_img,
      url: college_information.college_website,
      email: college_information.college_email,
      telephone: college_information.college_phone,
      address: college_information.location,
      college_brochure: college_information.college_brochure || "/",
    }),
    generateJSONLD("FAQPage", {
      mainEntity: parsedFAQs.map((faq, index) => ({
        "@type": "Question",
        name: faq.question || `FAQ ${index + 1}`,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer || "Answer not available",
        },
      })),
    }),
  ];

  const extractedData = {
    college_id: college_information.college_id,
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city,
    state: college_information.state,
    title: faqData[0]?.title || "College FAQs",
    location: college_information.location,
  };

  return (
    <>
      <Script
        id="college-faqs-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
      />
      <CollegeHead data={extractedData} />
      <CollegeNav data={college_information} />
      <section className="container-body md:grid grid-cols-4 gap-4 py-4">
        <div className="col-span-3 order-none md:order-1">
          <CollegeCourseContent content={faqData} news={news_section} />
        </div>
        <div className="col-span-1 mt-4">
          <Image src="/ads/static.svg" height={250} width={500} alt="ads" />
          <CollegeNews news={news_section} clgSlug={correctSlugId} />
        </div>
      </section>
    </>
  );
};

export default CollegeFAQs;
