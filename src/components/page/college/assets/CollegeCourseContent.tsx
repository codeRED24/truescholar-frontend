import { InfoSection } from "@/api/@types/college-info";
import { sanitizeHtml } from "@/components/utils/sanitizeHtml";
import dynamic from "next/dynamic";
import React from "react";

const TocGenerator = dynamic(
  () => import("@/components/miscellaneous/TocGenerator")
);

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
