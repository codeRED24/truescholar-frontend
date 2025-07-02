import React from "react";
import { FaClock } from "react-icons/fa";
import { TiStarFullOutline } from "react-icons/ti";
import { formatTuitionFee, getTrueRating } from "../utils/utils";
import { CourseVal } from "@/api/@types/college-info";
import Link from "next/link";

interface CourseCardProps {
  course: CourseVal;
  courseGroupName?: string;
}

const CourseCard = React.memo(
  ({
    course,
    courseGroupName,
  }: {
    course: CourseVal;
    courseGroupName?: string;
  }) => {
    const courseSlug = course?.course_name
      ? course.course_name
          .replace(/[^a-zA-Z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .toLowerCase()
      : courseGroupName
          ?.replace(/[^a-zA-Z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .toLowerCase() || "";

    const courseDetails = [
      {
        label: "No of Seats",
        value: `${course.seats_offered}+`,
        className: "text-[#00B8D9]",
      },
      {
        label: "Median Salary",
        value: `${formatTuitionFee(course.direct_salary)}`,
      },
      {
        label: "Tuition Fees",
        value: `${formatTuitionFee(course.direct_fees)}`,
      },
      {
        label: "Exam Accepted",
        value: course.exam_accepted?.[0]?.exam_name || "-",
        className: course.exam_accepted?.[0]?.exam_name && "text-[#00B8D9]",
      },
      {
        label: "Rating",
        value: `${getTrueRating(course.kapp_rating)}`,
        icon: course.kapp_rating && (
          <TiStarFullOutline className="inline-block text-primary-3 mr-1" />
        ),
        className: course.kapp_rating
          ? "text-primary-3 px-3 py-0.5 rounded-2xl"
          : "text-gray-500",
      },
    ];

    return (
      <div className="border border-[#F4F6F8] bg-white shadow-course rounded-2xl">
        <div className="flex justify-between items-center p-4 border-b border-[#DFE3E8] border-dashed">
          <div>
            <Link
              href={`course-${courseSlug}-${course.college_wise_course_id}`}
              className="text-base font-medium font-public leading-5"
            >
              {course?.course_name || courseGroupName || "Unnamed Course"}
            </Link>
            <div className="text-primary-main flex items-center gap-2 mt-2">
              <FaClock />
              <span>
                {course.duration} {course.duration_type}
              </span>
            </div>
          </div>
          <button className="px-3 py-1.5 border rounded-full font-semibold text-xxs md:text-sm flex items-center gap-1 bg-[#00A76F14] hover:bg-[#00A76F29] text-[#007867]">
            Compare <span className="text-md font-light">↑↓</span>
          </button>
        </div>

        <div className="flex justify-between items-center gap-4 flex-wrap p-4">
          {courseDetails.map(({ label, value, className, icon }) => (
            <div key={label} className="text-center">
              <p className="text-[#637381] text-xsm">{label}</p>
              <p
                className={`flex items-center justify-center text-sm font-semibold mt-1 ${className}`}
              >
                {icon} {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default CourseCard;
