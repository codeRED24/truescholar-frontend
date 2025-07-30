import ComaprisonComponent from "@/components/compare/university-comparison";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Universities in Australia | Course & Review Match Tool",
  description:
    "Use PickMyUni’s smart platform to compare universities in Australia by courses, reviews, campus life, and student ratings. Find the right match and transfer with confidence.",
  keywords: [
    "compare universities Australia",
    "university comparison tool",
    "Australian university rankings",
    "university fees comparison",
    "study abroad comparison",
    "higher education Australia",
  ],
  openGraph: {
    title:
      "Compare Universities in Australia | Course & Review Match Tool – PickMyUni",
    description:
      "Use PickMyUni’s smart platform to compare universities in Australia by courses, reviews, campus life, and student ratings. Find the right match and transfer with confidence.",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      {/* <BreadcrumbSchema items={commonBreadcrumbs.compare()} /> */}
      <ComaprisonComponent />
    </>
  );
}
