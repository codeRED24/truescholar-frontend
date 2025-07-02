import React from "react";
import {
  CollegeInformation,
  InfoSection,
  PopularCourse,
} from "@/api/@types/college-info";
import { sanitizeHtml } from "@/components/utils/sanitizeHtml";
import "@/app/styles/tables.css";
import Image from "next/image";
import { FaAngleRight, FaClock } from "react-icons/fa";
import {
  formatDurationRange,
  formatFeeRange,
  getTrueRating,
} from "@/components/utils/utils";
import { TiStarFullOutline } from "react-icons/ti";
import Link from "next/link";
import TocGenerator from "@/components/miscellaneous/TocGenerator";
import RatingComponent from "@/components/miscellaneous/RatingComponent";

interface CollegeInfoProps {
  data: CollegeInformation;
  news: InfoSection[];
  course: PopularCourse[];
  info: InfoSection[];
}

const InfoCard: React.FC<{
  label: string;
  value?: string | number | null;
  icon: string;
  className?: string;
}> = ({ label, value, icon }) => (
  <div className="group inline-flex items-center flex-wrap gap-4 p-2 md:p-4 overflow-auto no-scroll-bar bg-white hover:bg-primary-1 rounded-2xl border border-[#F4F6F8] hover:border-[#00A76F29]">
    <Image
      src={icon}
      alt={label}
      className="w-12 h-12 object-contain"
      height={40}
      width={40}
    />
    <div>
      <p className="text-gray-600 text-xxs md:text-sm">{label}</p>
      <p className="text-xs md:text-lg group-hover:text-primary-main font-medium">
        {value ? value : "-"}
      </p>
    </div>
  </div>
);

const CourseCard: React.FC<{ course: PopularCourse }> = ({ course }) => {
  const courseDetails = [
    {
      label: "No of specialisations",
      value: `${course.count}+`,
      className: "text-[#00B8D9]",
    },
    {
      label: "Median Salary",
      value: `${formatFeeRange(course.min_salary, course.max_salary)}`,
    },
    {
      label: "Tuition Fees",
      value: `${formatFeeRange(course.min_fees, course.max_fees)}`,
    },
    {
      label: "Exam Accepted",
      value: course.exam_accepted?.[0] || "-",
      className: course.exam_accepted?.length ? "text-[#00B8D9]" : "",
    },
    {
      label: "Rating",
      value: `${getTrueRating(course.rating)}`,
      icon: course.rating && (
        <TiStarFullOutline className="inline-block text-primary-3 mr-1" />
      ),
      className: course.rating
        ? "text-primary-3 px-3 py-0.5 rounded-2xl"
        : "text-gray-500",
    },
  ];

  return (
    <div className="border border-[#F4F6F8] bg-[#f5f6f8] my-4 p-4 shadow-course rounded-2xl">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            {course.course_group_full_name} (
            <span>{course.course_group_name}</span>)
          </h3>
          <div className="text-primary-main flex items-center gap-2">
            <FaClock />
            <span>
              {formatDurationRange(course.min_duration, course.max_duration)}
            </span>
          </div>
        </div>
        <button className="px-3 py-1.5 border rounded-full font-semibold text-xxs md:text-sm flex items-center gap-1 bg-[#00A76F14] hover:bg-[#00A76F29] text-[#007867]">
          Compare <span className="text-md font-light">↑↓</span>
        </button>
      </div>

      <div className="flex justify-between items-center gap-4 flex-wrap mt-4">
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
};
const CollegeInfoContent: React.FC<CollegeInfoProps> = ({
  data,
  info,
  course,
}) => {
  const overviewData = [
    {
      label: "Founded Year",
      value: data?.founded_year,
      icon: "/svg/calander.svg",
    },
    {
      label: "Total Courses",
      value: `${data?.course_count}+`,
      icon: "/svg/course.svg",
    },
    { label: "Rating", value: data?.kapp_rating, icon: "/svg/review.svg" },
    {
      label: "Institute Type",
      value: data?.type_of_institute,
      icon: "/svg/institute.svg",
    },
    {
      label: "Campus Size",
      value: data?.campus_size ? `${data?.campus_size} acres` : null,
      icon: "/svg/placement.svg",
    },
    { label: "NAAC Grade", value: data?.nacc_grade, icon: "/svg/ranking.svg" },
  ];

  const sanitizedHtml = sanitizeHtml(info[0]?.description || "");

  return (
    <>
      <div className="article-content-body">
        <h2 className="text-2xl font-semibold mb-4">
          Quick <span className="text-primary-main">Overview</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {overviewData.map((item, index) => (
            <InfoCard
              key={index}
              label={item.label}
              value={item.value}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
      <TocGenerator content={sanitizedHtml} />
      {sanitizedHtml && (
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      )}
      <RatingComponent />
      <div className="article-content-body">
        <h2 className="text-2xl font-semibold mb-4">
          {data.college_name.length < 60
            ? data?.college_name
            : data?.short_name}
          <span className="text-primary-main"> Popular Courses</span>
        </h2>
        <p>
          {data?.short_name} provides campus placement to students in various
          fields. It is known for its excellent placement records throughout the
          year.
        </p>
        {course.length > 0 &&
          course
            .slice(0, 4)
            .map((course) => (
              <CourseCard key={course.course_group_id} course={course} />
            ))}
        <Link
          href={`/colleges/${data.slug.replace(/-\d+$/, "")}-${
            data.college_id
          }/courses`}
          className="bg-black px-4 py-2 rounded-full text-white font-semibold text-sm flex items-center gap-2 w-fit ml-auto"
        >
          View All Courses <FaAngleRight />
        </Link>
      </div>
    </>
  );
};

export default CollegeInfoContent;
