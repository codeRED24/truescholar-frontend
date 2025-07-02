import { InfoSection } from "@/api/@types/college-info";
import TocGenerator from "@/components/miscellaneous/TocGenerator";
import { sanitizeHtml } from "@/components/utils/sanitizeHtml";
import React from "react";

interface CollegeCourseContentProps {
  news: InfoSection[];
  content: InfoSection[];
}

const CollegeCourseContent: React.FC<CollegeCourseContentProps> = ({
  news,
  content,
}) => {
  const sanitizedHtml = sanitizeHtml(content?.[0]?.description || "");

  return (
    <>
      {sanitizedHtml && <TocGenerator content={sanitizedHtml} />}

      {sanitizedHtml && (
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      )}
    </>
  );
};

export default CollegeCourseContent;
