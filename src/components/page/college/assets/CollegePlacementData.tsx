import { InfoSection } from "@/api/@types/college-info";
import { sanitizeHtml } from "@/components/utils/sanitizeHtml";
import React from "react";
import PlacementSummary from "./PlacementSummary";
import PlacementBarGraph from "./PlacementBarGraph";
import TocGenerator from "@/components/miscellaneous/TocGenerator";

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
            <span className="text-primary-main"> Placemnet</span>
          </h2>
          <PlacementSummary data={summaryData} />
          <PlacementBarGraph data={summaryData} />
        </div>
      )}
      {sanitizedHtml && (
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      )}
    </>
  );
};

export default CollegePlacementData;
