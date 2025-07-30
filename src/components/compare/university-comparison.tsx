import UniversityComparisonHero from "./UniversityComparisonHero";
import UniversityComparisonHeader from "./UniversityComparisonHeader";
import UniversityBenefits from "./UniversityBenefits";
import UniversityComparisonCTA from "./UniversityComparisonCTA";
import dynamic from "next/dynamic";
import { Suspense } from "react";

function ComparisonLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-main mr-3"></div>
      <span className="text-primary-main text-lg font-medium">
        Loading comparison...
      </span>
    </div>
  );
}

const UniversityComparisonForm = dynamic(
  () => import("./UniversityComparisonForm")
);
export default function ComaprisonComponent() {
  return (
    <div className="min-h-screen bg-[#F6F6F7]">
      <UniversityComparisonHero />
      <div className="container mx-auto py-12 lg:py-16">
        <UniversityComparisonHeader />
        <Suspense fallback={<ComparisonLoading />}>
          <UniversityComparisonForm />
        </Suspense>
        <hr className="mb-16 mt-8 border-gray-200" />
        <UniversityBenefits />
      </div>
      <UniversityComparisonCTA />
    </div>
  );
}
