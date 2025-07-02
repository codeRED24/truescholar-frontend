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

export async function generateMetadata(props: {
  params: Promise<{ "slug-id": string }>;
}): Promise<{
  title: string;
  description?: string;
  keywords?: string;
  alternates?: object;
  openGraph?: object;
}> {
  const params = await props.params;
  const slugId = params["slug-id"];
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return notFound();

  const collegeId = Number(match[2]);
  if (isNaN(collegeId)) return { title: "Invalid College" };

  try {
    const college = await getCollegeFees(collegeId);
    if (!college) return { title: "College Not Found" };

    const { college_information, fees_section } = college;
    const collegeSlug = college_information?.slug.replace(/-\d+$/, "");
    const content = fees_section?.content?.[0] || {};

    return {
      title:
        content.title ||
        college_information?.college_name ||
        "College Fees Details",
      description: content.meta_desc || "Find fees details about this college.",
      keywords:
        content.seo_param ||
        `${college_information?.college_name}, college fees, tuition fees, education`,
      alternates: {
        canonical: `https://www.truescholar.in/colleges/${collegeSlug}-${collegeId}/fees`,
      },
      openGraph: {
        title: content.title || "College Fees Details",
        description:
          content.meta_desc || "Find fees details about this college.",
        url: `https://www.truescholar.in/colleges/${collegeSlug}-${collegeId}/fees`,
      },
    };
  } catch (error) {
    return { title: "Error Fetching College Data" };
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

  try {
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
      .replace(/-\d+$/, "")
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

    const breadcrumbLD = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.truescholar.in",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Colleges",
          item: "https://www.truescholar.in/colleges",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: college_name,
          item: `https://www.truescholar.in/colleges/${correctSlugId}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Fees",
          item: `https://www.truescholar.in/colleges/${correctSlugId}/fees`,
        },
      ],
    };

    const extractedData = {
      college_name: college_information?.college_name || "",
      college_logo: college_information?.logo_img || "",
      city: college_information?.city || "",
      state: college_information?.state || "",
      location: college_information?.location || "",
      title: fees_section?.content?.[0]?.title || "",
      college_brochure: college_information.college_brochure || "/",
    };

    return (
      <>
        <Script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(clgLD) }}
        />
        <Script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLD) }}
        />

        <CollegeHead data={extractedData} />
        <CollegeNav data={college_information} />

        <section className="container-body md:grid grid-cols-4 gap-4 py-4">
          <div className="col-span-3 order-none md:order-1">
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
  } catch (error) {
    return notFound();
  }
};

export default CollegeFees;
