import { GreExamDTO } from "@/api/@types/exam-type";
import React from "react";
import ExamHead from "./ExamHead";
import { sanitizeHtml } from "@/components/utils/sanitizeHtml";
import TocGenerator from "@/components/miscellaneous/TocGenerator";
import ExamNav from "./ExamNav";
import "@/app/styles/tables.css";


const ExamContent: React.FC<{ exam: GreExamDTO }> = ({ exam }) => {
  const sanitizedHtml = sanitizeHtml(exam.examContent.description);
  return (
    <>
      <ExamHead
        data={exam.examInformation}
        title={exam.examContent.topic_title}
      />
      <ExamNav data={exam} />
      <div className="container-body">
        {sanitizedHtml && <TocGenerator content={sanitizedHtml} />}
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </div>
    </>
  );
};

export default ExamContent;
