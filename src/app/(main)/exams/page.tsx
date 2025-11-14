import ExamsList from "@/components/page/exam/ExamList";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Exams in India | TrueScholar - Explore Entrance Tests & Schedules",
  description:
    "Find detailed information about top exams in India, including eligibility, syllabus, important dates, and preparation tips. Stay updated with TrueScholar.",
  keywords:
    "Exams in India, entrance exams, competitive exams, college entrance tests, exam schedules, exam details",
  metadataBase: new URL("https://www.truescholar.in"),
  alternates: {
    canonical: "https://www.truescholar.in/exams",
  },
  openGraph: {
    title: "Exams in India | TrueScholar - Explore Entrance Tests & Schedules",
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
    title: "Exams in India | TrueScholar - Explore Entrance Tests & Schedules",
    description:
      "Explore detailed information on all major exams in India with TrueScholar.",
    images: ["https://www.truescholar.in/og-image.png"],
  },
};

const page = () => {
  return (
    <div>
      <ExamsList />
    </div>
  );
};

export default page;
