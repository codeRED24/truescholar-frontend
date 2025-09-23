import { InfoSection } from "@/api/@types/college-info";
import { sanitizeHtml } from "@/components/utils/sanitizeHtml";
import React from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic imports for better performance
const PlacementSummary = dynamic(() => import("./PlacementSummary"), {
  loading: () => <Skeleton className="h-32 bg-gray-200 rounded mb-4" />,
});

const PlacementBarGraphWrapper = dynamic(
  () => import("./PlacementBarGraphWrapper"),
  {
    loading: () => <Skeleton className="h-80 bg-gray-200 rounded" />,
  }
);

const TocGenerator = dynamic(
  () => import("@/components/miscellaneous/TocGenerator")
);

interface CollegePlacementDataProps {
  clg: string;
  content: InfoSection[];
  summaryData: any[];
}

const CollegePlacementData: React.FC<CollegePlacementDataProps> = ({
  clg,
  content,
  summaryData,
}) => {
  const sanitizedHtml = sanitizeHtml(content[0]?.description || "");

  return (
    <>
      {sanitizedHtml && <TocGenerator content={sanitizedHtml} />}
      {summaryData?.length > 0 && (
        <div className="article-content-body">
          <h2 className="line-clamp-1">
            {clg}
            <span className="text-primary-main"> Placement</span>
          </h2>
          <PlacementSummary data={summaryData} />
          <PlacementBarGraphWrapper
            data={summaryData}
            title={`${clg} Placement Statistics`}
            showTitle={false}
          />
        </div>
      )}
      {sanitizedHtml && (
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      )}
    </>
  );
};

export default CollegePlacementData;
