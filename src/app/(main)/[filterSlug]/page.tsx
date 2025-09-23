import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const ExamList = dynamic(() => import("@/components/page/exam/ExamList"));

const CollegeList = dynamic(
  () => import("@/components/page/college/CollegeList")
);

interface PageProps {
  params: Promise<{
    filterSlug: string;
  }>;
}

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { filterSlug } = await params;

  if (filterSlug.includes("exams-")) {
    return {
      title:
        "Exams in India | TrueScholar - Explore Entrance Tests & Schedules",
      description:
        "Find detailed information about top exams in India, including eligibility, syllabus, important dates, and preparation tips. Stay updated with TrueScholar.",
      keywords:
        "Exams in India, entrance exams, competitive exams, college entrance tests, exam schedules, exam details",
      metadataBase: new URL("https://www.truescholar.in"),
      alternates: {
        canonical: "https://www.truescholar.in/exams",
      },
      openGraph: {
        title:
          "Exams in India | TrueScholar - Explore Entrance Tests & Schedules",
        description:
          "Get the latest updates on top exams in India with details on eligibility, syllabus, dates, and preparation tips.",
        url: "https://www.truescholar.in/exams",
        siteName: "TrueScholar",
        images: [
          {
            url: "https://www.truescholar.in/og-image.png",
            width: 1200,
            height: 630,
            alt: "TrueScholar Exams",
          },
        ],
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title:
          "Exams in India | TrueScholar - Explore Entrance Tests & Schedules",
        description:
          "Explore detailed information on all major exams in India with TrueScholar.",
        images: ["https://www.truescholar.in/og-image.png"],
      },
    };
  } else if (filterSlug.includes("colleges-")) {
    return {
      title: "Top Colleges in India | TrueScholar - Explore & Compare Colleges",
      description:
        "Discover top colleges in India with TrueScholar. Compare courses, fees, eligibility, rankings, and more to find the best fit for your academic goals.",
      keywords:
        "colleges in India, top colleges, college list, best colleges, compare colleges, TrueScholar colleges",
      metadataBase: new URL("https://www.truescholar.in"),
      alternates: {
        canonical: "https://www.truescholar.in/colleges",
      },
      openGraph: {
        title:
          "Top Colleges in India | TrueScholar - Explore & Compare Colleges",
        description:
          "Find and compare top colleges in India based on rankings, courses, and fees with TrueScholar.",
        url: "https://www.truescholar.in/colleges",
        siteName: "TrueScholar",
        images: [
          {
            url: "https://www.truescholar.in/images/colleges-og.jpg",
            width: 1200,
            height: 630,
            alt: "TrueScholar College Listings",
          },
        ],
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title:
          "Top Colleges in India | TrueScholar - Explore & Compare Colleges",
        description:
          "Explore and compare the best colleges in India with TrueScholar. Get details on fees, courses, and eligibility.",
        images: ["https://www.truescholar.in/images/colleges-og.jpg"],
      },
    };
  } else {
    return {};
  }
};

const page = async ({ params }: PageProps) => {
  const { filterSlug } = await params;

  if (filterSlug.includes("exams-")) {
    return <ExamList />;
  } else if (filterSlug.includes("colleges-")) {
    return <CollegeList />;
  } else {
    notFound();
  }
};

export default page;
