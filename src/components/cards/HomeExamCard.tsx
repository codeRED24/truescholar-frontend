import { HomeExam } from "@/api/@types/home-datatype";
import React from "react";
import { formatDate } from "../utils/formatDate";
import Link from "next/link";

const HomeExamCard: React.FC<{ exam: HomeExam }> = ({ exam }) => {
  const { exam_name, level_of_exam, exam_date, mode_of_exam, slug, exam_id } =
    exam;
  return (
    <div className="bg-white shadow-card1 rounded-xl border border-[#F9FAFB]">
      <div className="text-center flex justify-center items-center flex-col p-4">
        <h3 className="font-semibold line-clamp-1">{exam_name}</h3>
        <p className="text-[#637381] text-md">{level_of_exam}</p>
      </div>
      <div className="flex justify-around items-center border-y border-dashed border-[#DFE3E8] p-4">
        <div>
          <p className="text-sm text-[#637381] text-center">Exam Date</p>
          <p className="font-public font-medium text-center text-md">
            {formatDate(exam_date)}
          </p>
        </div>
        <div>
          <p className="text-sm text-[#637381] text-center">Mode</p>
          <p className="font-public font-medium text-center text-md">{mode_of_exam}</p>
        </div>
      </div>
      <div className="p-4 text-center">
        <Link
          href={`/exams/${slug}-${exam_id}`}
          className="text-primary-3 bg-[#22C55E29] px-3 py-0.5 rounded-full"
        >
          View More Details
        </Link>
      </div>
    </div>
  );
};

export default React.memo(HomeExamCard);
