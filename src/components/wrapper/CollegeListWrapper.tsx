import { Metadata } from "next";
import dynamic from "next/dynamic";

const CollegeList = dynamic(() => import("../page/college/CollegeList"));

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
        url: "https://www.truescholar.in/images/colleges-og.jpg", // Replace with actual image
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
    images: ["https://www.truescholar.in/images/colleges-og.jpg"], // Replace with actual image
  },
};

export default function ExamListWrapper() {
  return <CollegeList />;
}
