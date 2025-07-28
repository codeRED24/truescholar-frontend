import { Metadata } from "next";
import dynamic from "next/dynamic";

const ExamsList = dynamic(() => import("../page/exam/ExamList"));

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
  // openGraph: {
  //   title: "Exams in India | TrueScholar - Explore Entrance Tests & Schedules",
  //   description:
  //     "Get the latest updates on top exams in India with details on eligibility, syllabus, dates, and preparation tips.",
  //   url: "https://www.truescholar.in/exams",
  //   siteName: "TrueScholar",
  //   images: [
  //     {
  //       url: "https://www.truescholar.in/images/exams-og.jpg", // Replace with actual image
  //       width: 1200,
  //       height: 630,
  //       alt: "TrueScholar Exams",
  //     },
  //   ],
  //   locale: "en_US",
  //   type: "website",
  // },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "Exams in India | TrueScholar - Explore Entrance Tests & Schedules",
  //   description:
  //     "Explore detailed information on all major exams in India with TrueScholar.",
  //   images: ["https://www.truescholar.in/images/exams-og.jpg"], // Replace with actual image
  // },
};

export default function ExamListWrapper() {
  return <ExamsList />;
}
