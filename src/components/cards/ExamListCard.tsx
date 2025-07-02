import { ExamInformationDTO } from "@/api/@types/exam-type";
import React from "react";
import { formatDate } from "../utils/formatDate";
import Link from "next/link";

const ExamListCard: React.FC<{ exam: ExamInformationDTO }> = ({ exam }) => {
  const examDetails = [
    { label: "Level", value: exam.exam_level },
    { label: "Mode", value: exam.mode_of_exam },
    { label: "Duration", value: `${exam.exam_duration} minutes` },
    // {
    //   label: "Application",
    //   value: `${formatDate(exam.application_start_date)} - ${formatDate(
    //     exam.application_end_date
    //   )}`,
    // },
    {
      label: "Exam Date",
      value: formatDate(exam.exam_date),
    },
  ].filter(Boolean);

  return (
    <div className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-card1 hover:shadow-md transition-shadow duration-300">
      <h2 className="text-base font-semibold text-[#1C252E]">
        <span className="line-clamp-1">{exam.exam_name}</span>(
        {exam.exam_shortname})
      </h2>
      <div className="text-sm grid grid-cols-2 gap-4 py-4 border-b border-dashed">
        {examDetails.map(
          (detail, index) =>
            detail && (
              <div
                key={index}
                className="flex flex-col items-center justify-center rounded-2xl  py-4 bg-[#F9FAFB] border border-[#DFE3E8]"
              >
                <p className="text-[#1C252E] font-medium text-md font-public">
                  {detail.value}
                </p>
                <p className="font-medium text-[#637381]">{detail.label}</p>
              </div>
            )
        )}
      </div>
      <div className="flex items-center justify-between pt-4">
        <p className="font-semibold text-md">Eligibility</p>
        <Link
          href={`/exams/${exam.slug}-${exam.exam_id}`}
          className="text-primary-3 bg-[#22C55E29] px-3 py-0.5 font-semibold rounded-full"
        >
          View More Details
        </Link>
      </div>
    </div>
  );
};

export default ExamListCard;
