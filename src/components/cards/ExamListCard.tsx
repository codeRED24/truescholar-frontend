import { ExamInformationDTO } from "@/api/@types/exam-type";
import React from "react";
import Image from "next/image";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import dayjs from "dayjs";
import { Button } from "../ui/button";
import { Calendar, Building2, Layers, ChevronRight } from "lucide-react";
import Link from "next/link";

const ExamListCard: React.FC<{ exam: ExamInformationDTO }> = ({ exam }) => {
  const logoUrl = exam.exam_logo || "/svg/exam.webp";

  return (
    <Card className="p-5 border border-gray-200/60 rounded-xl bg-white hover:bg-gray-50 transition-colors duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left Section */}
        <div className="flex items-start gap-4 flex-1">
          <Image
            src={logoUrl}
            alt={exam.exam_name}
            width={52}
            height={52}
            className="rounded-lg  bg-white object-cover"
          />

          <div className="flex flex-col gap-2 w-full overflow-hidden">
            {/* Title */}
            <Link href={`/exams/${exam.slug}-${exam.exam_id}`}>
              <h2 className="text-[18px] hover:underline cursor-pointer font-medium text-gray-900 line-clamp-2 lg:line-clamp-1">
                {exam.exam_name}
              </h2>
            </Link>

            {/* Meta row */}
            <div className="flex items-center gap-4 text-[13px] text-gray-600 overflow-x-auto scrollbar-hide">
              <Badge
                variant={"secondary"}
                className="px-2.5 py-0.5 bg-neutral-200 hover:bg-neutral-300 rounded-md text-[12px] whitespace-nowrap flex-shrink-0"
              >
                {exam.mode_of_exam}
              </Badge>

              {exam.conducting_authority && (
                <span className="flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                  <Building2
                    size={14}
                    className="text-gray-500 flex-shrink-0"
                  />
                  {exam.conducting_authority}
                </span>
              )}

              {exam.stream_name && (
                <span className="flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                  <Layers size={14} className="text-gray-500 flex-shrink-0" />
                  {exam.stream_name}
                </span>
              )}
            </div>

            {/* Date Row */}
            <div className="flex gap-6 mt-1 text-[13px] text-gray-700 overflow-x-auto scrollbar-hide">
              {exam.exam_date && (
                <div className="space-y-0.5 flex-shrink-0">
                  <div className="text-gray-500 flex items-center gap-1 text-[12px] whitespace-nowrap">
                    <Calendar size={13} className="flex-shrink-0" /> Exam Date
                  </div>
                  <span className="font-medium whitespace-nowrap">
                    {dayjs(exam.exam_date).format("DD MMM YYYY")}
                  </span>
                </div>
              )}

              {(exam.application_start_date || exam.application_end_date) && (
                <div className="space-y-0.5 flex-shrink-0">
                  <div className="text-gray-500 flex items-center gap-1 text-[12px] whitespace-nowrap">
                    <Calendar size={13} className="flex-shrink-0" />{" "}
                    Registrations
                  </div>
                  <span className="font-medium whitespace-nowrap">
                    {exam.application_start_date
                      ? dayjs(exam.application_start_date).format("DD MMM YYYY")
                      : "-"}{" "}
                    –{" "}
                    {exam.application_end_date
                      ? dayjs(exam.application_end_date).format("DD MMM YYYY")
                      : "-"}
                  </span>
                </div>
              )}

              {exam.result_date && (
                <div className="space-y-0.5 flex-shrink-0">
                  <div className="text-gray-500 flex items-center gap-1 text-[12px] whitespace-nowrap">
                    <Calendar size={13} className="flex-shrink-0" /> Results
                  </div>
                  <span className="font-medium whitespace-nowrap">
                    {dayjs(exam.result_date).format("DD MMM YYYY")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="gap-2 min-w-[150px]">
          <Button
            size="sm"
            asChild
            className="group  w-full text-[14px] font-medium py-2 bg-primary-main text-white rounded-md"
          >
            <Link href={`/exams/${exam.slug}-${exam.exam_id}`}>
              View Details{" "}
              <ChevronRight className="group-hover:translate-x-1 transition duration-300" />
            </Link>
          </Button>
          {/* 
          <Button
            size="sm"
            variant="outline"
            className="w-full text-[14px] font-medium py-2 rounded-md border-gray-300"
          >
            View Details
          </Button> */}
        </div>
      </div>
    </Card>
  );
};

export default ExamListCard;
