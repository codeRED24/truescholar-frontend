import { getCollegeHighlightsById } from "@/api/individual/getIndividualCollege";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import TocGenerator from "@/components/miscellaneous/TocGenerator";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import React from "react";
import "@/app/styles/tables.css";
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

  const college = await getCollegeHighlightsById(collegeId);
  if (!college)
    return {
      title: "College Highlights Not Available | TrueScholar",
      description:
        "Highlights information for this college is currently not available. Explore other colleges and their key features on TrueScholar.",
      robots: { index: false, follow: true },
    };

  const { college_information, highlight_section } = college;
  const collegeName = college_information?.college_name || "College Highlights";

  const location =
    college_information.city && college_information.state
      ? `${college_information.city}, ${college_information.state}`
      : college_information.city || college_information.state || "";

  const collegeSlug = college_information?.slug.replace(/(?:-\d+)+$/, "");
  const canonicalUrl = `https://www.truescholar.in/colleges/${collegeSlug}-${collegeId}/highlights`;
  const highlight = highlight_section?.[0] || {};

  // Create SEO-optimized title with location and keywords
  const defaultTitle = location
    ? `${collegeName} Highlights ${dayjs().year()} - ${location} | Courses, Fees, Facilities | TrueScholar`
    : `${collegeName} Highlights ${dayjs().year()} | Courses, Fees, Facilities, Reviews | TrueScholar`;

  const metaDesc =
    highlight.meta_desc ||
    `Discover ${collegeName} highlights including courses offered, fee structure, facilities, faculty, infrastructure, and student reviews. Get comprehensive information about admission process, eligibility criteria, and campus life at ${collegeName}${
      location ? ` in ${location}` : ""
    }.`;

  const ogImage =
    college_information.logo_img || "https://www.truescholar.in/og-image.png";

  return {
    title: highlight.title || defaultTitle,
    description: metaDesc,
    keywords:
      highlight.seo_param ||
      `${collegeName} highlights, ${collegeName} courses, ${collegeName} fees, ${collegeName} facilities, ${collegeName} reviews, college information India${
        location ? `, ${location} colleges` : ""
      }`,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: highlight.title || defaultTitle,
      description: metaDesc,
      url: canonicalUrl,
      type: "website",
      siteName: "TrueScholar",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${collegeName} Highlights`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: highlight.title || defaultTitle,
      description: metaDesc,
      images: [ogImage],
    },
  };
}

const CollegeHighlights = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const params = await props.params;
  const { "slug-id": slugId } = params;
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return notFound();

  const collegeId = Number(match[2]);
  if (isNaN(collegeId)) return notFound();

  const college = await getCollegeHighlightsById(collegeId);
  if (!college) return notFound();

  const { college_information, highlight_section, news_section } = college;
  const trimmedSlug = college_information?.slug.replace(/(?:-\d+)+$/, "") || "";
  const correctSlugId = `${trimmedSlug}-${collegeId}`;

  if (slugId !== correctSlugId) {
    return redirect(`/colleges/${correctSlugId}/highlights`);
  }
  const highlight = highlight_section?.[0] || {};
  const description = highlight.description || "";

  const extractedData = {
    college_id: college_information.college_id,
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city,
    state: college_information.state,
    title: highlight.title || "",
    location: college_information.location,
    college_brochure: college_information.college_brochure || "/",
  };

  const generateLDJson = () => [
    {
      "@context": "https://schema.org",
      "@type": "CollegeOrUniversity",
      name: college_information.college_name,
      logo: college_information.logo_img,
      url: college_information.college_website,
      email: college_information.college_email,
      telephone: college_information.college_phone,
      address: college_information.location,
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: highlight.title,
      description:
        highlight.meta_desc ||
        "Details of the admission process for this college.",
      author: {
        "@type": "Person",
        name: highlight.author_name || "Unknown Author",
      },
      datePublished: highlight.updated_at,
      dateModified: highlight.updated_at,
      image: {
        "@type": "ImageObject",
        url: college_information.logo_img,
        height: 800,
        width: 800,
      },
      publisher: {
        "@type": "Organization",
        name: "TrueScholar",
        logo: {
          "@type": "ImageObject",
          url: "https://www.truescholar.in/logo-dark.webp",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://www.truescholar.in/colleges/${correctSlugId}/highlights`,
      },
    },
  ];

  return (
    <>
      {generateLDJson().map((ld, idx) => (
        <Script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      <div className="bg-gray-2">
        <CollegeHead data={extractedData} />
        <CollegeNav data={college_information} />

        <div className="container-body md:grid grid-cols-12 gap-4 pt-4">
          <div className="col-span-3 mt-4">
            <Image src="/ads/static.svg" height={250} width={500} alt="ads" />
            <CollegeNews news={news_section} clgSlug={correctSlugId} />
          </div>
          <div className="col-span-9">
            {description && <TocGenerator content={description} />}
            <div dangerouslySetInnerHTML={{ __html: description }} />
            <RatingComponent />
          </div>
        </div>
      </div>
    </>
  );
};

export default CollegeHighlights;
