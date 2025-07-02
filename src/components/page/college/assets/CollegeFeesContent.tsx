import { InfoSection } from "@/api/@types/college-info";
import TocGenerator from "@/components/miscellaneous/TocGenerator";
import { sanitizeHtml } from "@/components/utils/sanitizeHtml";
import React from "react";

interface CollegeFeesContentProps {
  news: InfoSection[];
  content: InfoSection[];
}

const CollegeFeesContent: React.FC<CollegeFeesContentProps> = ({
  news,
  content,
}) => {
  const sanitizedHtml = sanitizeHtml(content?.[0]?.description || "");
  return (
    <div>
      {sanitizedHtml && <TocGenerator content={sanitizedHtml} />}
      {sanitizedHtml && (
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      )}
    </div>
  );
};

export default CollegeFeesContent;
