import { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

const CollegeList = dynamic(
  () => import("@/components/page/college/CollegeList"),
  {
    loading: () => (
      <div className="animate-pulse p-4 bg-gray-200 rounded-2xl h-32" />
    ),
  }
);

export const metadata: Metadata = {
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
    title: "Top Colleges in India | TrueScholar - Explore & Compare Colleges",
    description:
      "Find and compare top colleges in India based on rankings, courses, and fees with TrueScholar.",
    url: "https://www.truescholar.in/colleges",
    siteName: "TrueScholar",
    images: [
      {
        url: "https://www.truescholar.in/og-image.png",
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
    title: "Top Colleges in India | TrueScholar - Explore & Compare Colleges",
    description:
      "Explore and compare the best colleges in India with TrueScholar. Get details on fees, courses, and eligibility.",
    images: ["https://www.truescholar.in/og-image.png"],
  },
};

const Colleges = () => {
  return (
    <div>
      <CollegeList />
    </div>
  );
};

export default Colleges;
