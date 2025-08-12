"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LucideBookOpenText, LucideUniversity } from "lucide-react";
import { capitalFirst } from "../utils/capitalFirst";

type University = {
  id: number;
  collegeId: string | null;
  collegeName: string;
  courseId: string | null;
  courseName: string | null;
  data: any | null;
};

interface ComparisonTableProps {
  universities: University[];
}

const CourseComparisonTable = ({ universities }: ComparisonTableProps) => {
  // const [widthCourseCol1, setWidthCourseCol1] = useState(null);
  // const [widthCourseCol2, setWidthCourseCol2] = useState(null);
  // const [widthCourseCol3, setWidthCourseCol3] = useState(null);

  const getCourseForUni = (uni: University) => {
    if (!uni.data || !uni.data.college || !uni.courseId) return null;
    return (
      uni.data.college.CollegesCourses.find(
        (c: any) => String(c.college_wise_course_id) === uni.courseId
      ) || null
    );
  };

  const courseInfoRows = [
    {
      label: "Name",
      getValue: (course: any) => course?.name || "-",
    },
    {
      label: "Format",
      getValue: (course: any) => course?.course_format || "-",
    },
    {
      label: "Eligibility",
      getValue: (course: any) => course?.eligibility || "-",
    },
    {
      label: "Mode",
      getValue: (course: any) =>
        course?.is_online === true
          ? "Online"
          : course?.is_online === false
          ? "Offline"
          : "-",
    },
    {
      label: "Level",
      getValue: (course: any) =>
        capitalFirst(course?.level?.split("_").join(" ")) || "-",
    },
    {
      label: "Total Seats",
      getValue: (course: any) => course?.total_seats || "-",
    },
    {
      label: "Duration",
      getValue: (course: any) =>
        course?.duration_in_months && course?.duration_type
          ? `${course?.duration} ${course?.duration_type}`
          : "-",
    },
    {
      label: "Total Fees",
      getValue: (course: any) =>
        course?.fees ? `INR ${Number(course?.fees).toLocaleString()}` : "-",
    },
    {
      label: "Estimated Salary Offered",
      getValue: (course: any) =>
        course?.salary ? `INR ${Number(course?.salary).toLocaleString()}` : "-",
    },
  ];

  return (
    <div>
      <span className="text-primary-main flex items-center gap-4 text-[26px] font-semibold">
        <LucideBookOpenText /> Course info
      </span>
      <Table>
        <TableHeader>
          <TableRow className="bg-primary-main/90 hover:bg-primary-5">
            <TableHead className="border-x-2 border-white text-white">
              Subject
            </TableHead>
            {universities.map((uni) => (
              <TableHead
                key={uni.id}
                className="border-x-2 border-white text-center text-white"
              >
                {uni.collegeName || "Select University"}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {courseInfoRows.map((row, index) => {
            let rowBg = index % 2 === 0 ? "bg-[#F9F9F9]" : "bg-[#F0F0F0]";
            if (index === courseInfoRows.length - 2) rowBg = "bg-primary-2/20";
            if (index === courseInfoRows.length - 1) rowBg = "bg-primary-2/30";
            return (
              <TableRow className={`text-h4 leading-tight `} key={index}>
                <TableCell
                  className={`border-x-2 border-white  font-medium ${
                    index % 2 === 0 ? "bg-[#F9F9F9]" : "bg-[#F0F0F0]"
                  }`}
                >
                  {row.label}
                </TableCell>
                {universities.map((uni) => {
                  const course = getCourseForUni(uni);
                  return (
                    <TableCell
                      key={uni.id}
                      className={`border-x-2 border-white text-center ${rowBg}`}
                    >
                      {uni.collegeId ? row.getValue(course) : "-"}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const InstitutionComparisonTable = ({ universities }: ComparisonTableProps) => {
  const institutionInfoRows = [
    {
      label: "Established",
      getValue: (uni: University) => uni.data?.college?.founded_year || "-",
    },
    {
      label: "Type of Institution",
      getValue: (uni: University) => {
        return uni.data?.college?.type_of_institute || "-";
      },
    },
    {
      label: "Total Courses",
      getValue: (uni: University) =>
        uni.data?.college?.coursesCount + "+" || "-",
    },
    {
      label: "Total Students",
      getValue: (uni: University) =>
        uni.data?.college?.total_student
          ? Number(uni.data.college.total_student).toLocaleString()
          : "-",
    },
    {
      label: "Campus Size",
      getValue: (uni: University) => uni.data?.college?.campus_size || "-",
    },
  ];

  return (
    <div className="mt-12">
      <span className="text-[#141A21] flex items-center gap-4 text-[26px] font-semibold">
        <LucideUniversity /> Institution info
      </span>
      <Table>
        <TableHeader>
          <TableRow className="bg-[#141A21]/90 hover:bg-[#141A21]">
            <TableHead
              // ref={instituteDiv1}
              className="border-x-2 border-white text-white"
            >
              Subject
            </TableHead>
            {universities.map((uni) => (
              <TableHead
                key={uni.id}
                className="border-x-2 border-white text-center text-white"
              >
                {uni.collegeName || "Select University"}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {institutionInfoRows.map((row, index) => {
            let rowBg = index % 2 === 0 ? "bg-[#F9F9F9]" : "bg-[#F0F0F0]";
            return (
              <TableRow
                className={`text-h4 leading-tight ${rowBg}`}
                key={index}
              >
                <TableCell className="border-x-2 border-white font-medium">
                  {row.label}
                </TableCell>
                {universities.map((uni) => (
                  <TableCell
                    key={uni.id}
                    className="border-x-2 border-white text-center"
                  >
                    {uni.collegeId ? row.getValue(uni) : "-"}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export { CourseComparisonTable, InstitutionComparisonTable };
