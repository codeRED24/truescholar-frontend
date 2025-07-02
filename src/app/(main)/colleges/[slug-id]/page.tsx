import React from "react";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import { getCollegeById } from "@/api/individual/getIndividualCollege";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import CollegeInfoContent from "@/components/page/college/assets/CollegeInfoContent";
import "@/app/styles/tables.css";
import CollegeNews from "@/components/page/college/assets/CollegeNews";
import Image from "next/image";

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
  const defaultMetadata = {
    title: "College Not Found",
    description: "The requested college could not be found.",
    keywords: "college, not found",
    alternates: { canonical: "https://www.truescholar.in" },
  };

  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return defaultMetadata;

  const collegeId = Number(match[2]);
  if (isNaN(collegeId)) return defaultMetadata;

  const college = await getCollegeById(collegeId, true);
  if (!college) return defaultMetadata;

  const { info_section, college_information } = college;
  const info = info_section?.[0];
  const collegeSlug = college_information.slug.replace(/-\d+$/, "");

  return {
    title:
      info?.title || college_information.college_name || defaultMetadata.title,
    description:
      info?.meta_desc ||
      `Explore courses, scholarships, and more at ${college_information.college_name}`,
    keywords:
      info?.seo_param ||
      `${college_information.college_name}, college, courses`,
    alternates: {
      canonical: `https://www.truescholar.in/colleges/${collegeSlug}-${collegeId}`,
    },
    openGraph: {
      title: info?.title || college_information.college_name,
      description:
        info?.meta_desc ||
        `Explore courses, scholarships, and more at ${college_information.college_name}`,
      url: `https://www.truescholar.in/colleges/${collegeSlug}-${collegeId}`,
    },
  };
}

export const revalidate = 21600;

const IndividualCollege = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const params = await props.params;
  const { "slug-id": slugId } = params;
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return notFound();

  const collegeId = Number(match[2]);
  if (isNaN(collegeId)) return notFound();

  const college = await getCollegeById(collegeId);
  if (!college) return notFound();

  //   const collegeSchema = await getCollegeById(collegeId, true);
  const {
    college_information,
    info_section,
    popular_courses,
    exam_section,
    news_section,
  } = college;

  const collegeSlug = college_information.slug.replace(/-\d+$/, "");
  const correctSlugId = `${collegeSlug}-${collegeId}`;

  if (slugId !== correctSlugId) {
    return redirect(`/colleges/${correctSlugId}`);
  }
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollegeOrUniversity",
        name: college_information.college_name,
        logo: college_information.logo_img,
        url: `https://www.truescholar.in/colleges/${correctSlugId}`,
      },
      {
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
            name: college_information.college_name,
            item: `https://www.truescholar.in/colleges/${correctSlugId}`,
          },
        ],
      },
      ...(info_section?.[0]
        ? [
            {
              "@context": "https://schema.org",
              "@type": "Article",
              inLanguage: "en",
              headline: info_section[0].title,
              description: info_section[0].meta_desc,
              dateModified: new Date().toISOString(),
              datePublished: new Date().toISOString(),
              url: `https://www.truescholar.in/colleges/${correctSlugId}`,
              mainEntityOfPage: {
                "@id": `https://www.truescholar.in/colleges/${correctSlugId}`,
                "@type": "WebPage",
                name: college_information.college_name,
              },
              author: {
                "@type": "Person",
                name: info_section[0].author_name || "TrueScholar",
                url: `https://www.truescholar.in/team/${
                  info_section[0].author_id || 16
                }`,
                image:
                  info_section[0].author_image ||
                  "https://www.truescholar.in/logo.webp",
              },
              publisher: {
                "@type": "Organization",
                name: "TrueScholar",
                logo: {
                  "@type": "ImageObject",
                  url: "https://www.truescholar.in/logo.webp",
                },
              },
              image: {
                "@type": "ImageObject",
                url: college_information.logo_img,
              },
            },
          ]
        : []),
    ],
  };
  const extractedData = {
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city,
    state: college_information.state,
    college_brochure: college_information.college_brochure || "/",
    title: info_section?.[0]?.title || "",
    location: college_information.location,
  };
  return (
    <>
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <CollegeHead data={extractedData} />
      <CollegeNav data={college_information} />
      <section className="container-body md:grid grid-cols-4 gap-4 py-4">
        <div className="col-span-3 order-none md:order-1">
          <CollegeInfoContent
            data={college_information}
            info={info_section}
            news={news_section}
            course={popular_courses}
          />
        </div>
        <div className="col-span-1 mt-4">
          <Image src="/ads/static.svg" height={250} width={500} alt="ads" />
          <CollegeNews news={news_section} clgSlug={correctSlugId} />
        </div>
      </section>
    </>
  );
};

export default React.memo(IndividualCollege);
