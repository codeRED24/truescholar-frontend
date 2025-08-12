"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LucideBookOpenText, LucideUniversity, Trophy } from "lucide-react";
import { capitalFirst } from "../utils/capitalFirst";
import { BriefcaseBusiness } from "lucide-react";
import Image from "next/image";

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
  const getCourseForUni = (uni: University) => {
    if (!uni.data || !uni.data.college || !uni.courseId) return null;
    return (
      uni.data.college.CollegesCourses.find(
        (c: any) => String(c.college_wise_course_id) === uni.courseId
      ) || null
    );
  };

  const getFeesForCourse = (uni: University) => {
    if (!uni.data || !uni.data.college || !uni.courseId) return null;
    const fees = uni.data.college.fees;
    // // If fees is an array (legacy), find by course_group_id
    // if (Array.isArray(fees)) {
    //   return (
    //     fees.find(
    //       (f: any) =>
    //         String(f.course_group_id) ===
    //         String(getCourseForUni(uni)?.course_group_id)
    //     ) || null
    //   );
    // }
    // If fees is an object, return it directly
    if (fees && typeof fees === "object") {
      return fees;
    }
    return null;
  };

  const formatFeeRange = (min?: number, max?: number) => {
    const hasMin = !!min && min > 0;
    const hasMax = !!max && max > 0;

    if (!hasMin && !hasMax) return "-";
    if (hasMin && hasMax)
      return `INR ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (hasMin) return `INR ${min.toLocaleString()}`;
    if (hasMax) return `INR ${max.toLocaleString()}`;
    return "-";
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
      getValue: (_course: any, uni: University) => {
        const fees = getFeesForCourse(uni);
        return fees?.duration ? fees.duration : "-";
      },
    },
    {
      label: "One Time Fees",
      getValue: (_course: any, uni: University) => {
        const fees = getFeesForCourse(uni);
        return fees
          ? formatFeeRange(fees.max_one_time_fees, fees.min_one_time_fees)
          : "-";
      },
    },
    {
      label: "Tuition Fees",
      getValue: (_course: any, uni: University) => {
        const fees = getFeesForCourse(uni);
        return fees
          ? formatFeeRange(
              fees.tution_fees_min_amount,
              fees.tution_fees_max_amount
            )
          : "-";
      },
    },
    {
      label: "Hostel Fees",
      getValue: (_course: any, uni: University) => {
        const fees = getFeesForCourse(uni);
        return fees
          ? formatFeeRange(fees.min_hostel_fees, fees.max_hostel_fees)
          : "-";
      },
    },
    {
      label: "Other Fees",
      getValue: (_course: any, uni: University) => {
        const fees = getFeesForCourse(uni);
        return fees
          ? formatFeeRange(fees.max_other_fees, fees.min_other_fees)
          : "-";
      },
    },
    {
      label: "Total Fees",
      getValue: (_course: any, uni: University) => {
        const fees = getFeesForCourse(uni);
        return fees
          ? formatFeeRange(fees.total_min_fees, fees.total_max_fees)
          : "-";
      },
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
                      {uni.collegeId ? row.getValue(course, uni) : "-"}
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

const PlacementComparisonTable = ({ universities }: ComparisonTableProps) => {
  // Gather all placement data
  const allPlacements = universities.flatMap(
    (uni) => uni.data?.college?.college_wise_placement || []
  );
  // Get all unique years, sorted descending
  const years = Array.from(
    new Set(allPlacements.map((p) => p.year).filter(Boolean))
  ).sort((a, b) => b - a);
  // Group particulars by year
  const yearToRows: Record<number, { label: string; particulars: string }[]> =
    {};
  years.forEach((year) => {
    yearToRows[year] = [];
    allPlacements.forEach((p) => {
      if (p.year === year) {
        if (
          !yearToRows[year].some((row) => row.particulars === p.particulars)
        ) {
          yearToRows[year].push({
            label: p.particulars,
            particulars: p.particulars,
          });
        }
      }
    });
    // Optionally sort particulars alphabetically
    yearToRows[year].sort((a, b) => a.label.localeCompare(b.label));
  });
  // Pastel background colors for year groups
  const yearColors = [
    { main: "bg-orange-100/50", light: "bg-orange-100/20" },
    { main: "bg-blue-100/50", light: "bg-blue-100/20" },
    { main: "bg-green-100/50", light: "bg-green-100/20" },
    { main: "bg-pink-100/50", light: "bg-pink-100/20" },
    { main: "bg-indigo-100/50", light: "bg-indigo-100/20" },
    { main: "bg-yellow-100/50", light: "bg-yellow-100/20" },
  ];

  return (
    <div className="mt-12">
      <span className="text-[#1A3A2D] flex items-center gap-4 text-[26px] font-semibold">
        <BriefcaseBusiness /> Placement info
      </span>
      <Table>
        <TableHeader>
          <TableRow className="bg-[#1A3A2D]/90 hover:bg-[#1A3A2D]">
            <TableHead className="border-x-2 border-white text-white">
              Year
            </TableHead>
            <TableHead className="border-x-2 border-white text-white">
              Particular
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
          {years.flatMap((year, yearIdx) => {
            const yearRows = yearToRows[year];
            const yearColor = yearColors[yearIdx % yearColors.length];

            return yearRows.map((row, idx) => {
              const isEven = idx % 2 === 0;
              const cellBg = isEven ? yearColor.main : yearColor.light;

              return (
                <TableRow
                  className={`text-h4 leading-tight`}
                  key={year + row.particulars}
                >
                  {idx === 0 && (
                    <TableCell
                      rowSpan={yearRows.length}
                      className={`border-x-2 text-center border-white font-medium align-middle ${yearColor.main}`}
                    >
                      {year}
                    </TableCell>
                  )}
                  <TableCell
                    className={`border-x-2 border-white font-medium ${cellBg}`}
                  >
                    {row.label}
                  </TableCell>
                  {universities.map((uni) => {
                    const placements =
                      uni.data?.college?.college_wise_placement || [];
                    const placement = placements.find(
                      (p: any) =>
                        p.year === year && p.particulars === row.particulars
                    );
                    return (
                      <TableCell
                        key={uni.id}
                        className={`border-x-2 border-white text-center ${cellBg}`}
                      >
                        {uni.collegeId
                          ? placement
                            ? placement.title
                            : "-"
                          : "-"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            });
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const RankingComparisonTable = ({ universities }: ComparisonTableProps) => {
  // Gather all ranking data
  const allRankings = universities.flatMap(
    (uni) => uni.data?.college?.college_ranking || []
  );

  // Get all unique ranking titles (agencies), sorted alphabetically
  const rankingTitles = Array.from(
    new Set(allRankings.map((r) => r.rank_title).filter(Boolean))
  ).sort();

  // Group rankings by ranking agency and get unique year-category combinations
  const agencyToRows: Record<
    string,
    { label: string; year: number; category?: string }[]
  > = {};

  rankingTitles.forEach((rank_title) => {
    agencyToRows[rank_title] = [];

    // Get all unique year-category combinations for this agency
    const agencyRankings = allRankings.filter(
      (r) => r.rank_title === rank_title
    );
    const uniqueYearCategories = new Set();

    agencyRankings.forEach((ranking) => {
      const key = `${ranking.year}-${ranking.category || "general"}`;
      if (!uniqueYearCategories.has(key)) {
        uniqueYearCategories.add(key);
        const label = ranking.category
          ? `${ranking.year} (${ranking.category})`
          : `${ranking.year}`;
        agencyToRows[rank_title].push({
          label,
          year: ranking.year,
          category: ranking.category,
        });
      }
    });

    // Sort by year descending, then by category
    agencyToRows[rank_title].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return (a.category || "").localeCompare(b.category || "");
    });
  });

  // Pastel background colors for agency groups
  const agencyColors = [
    { main: "bg-purple-100/50", light: "bg-purple-100/20" },
    { main: "bg-amber-100/50", light: "bg-amber-100/20" },
    { main: "bg-teal-100/50", light: "bg-teal-100/20" },
    { main: "bg-rose-100/50", light: "bg-rose-100/20" },
    { main: "bg-cyan-100/50", light: "bg-cyan-100/20" },
    { main: "bg-lime-100/50", light: "bg-lime-100/20" },
  ];

  return (
    <div className="mt-12">
      <span className="text-[#8B5A2B] flex items-center gap-4 text-[26px] font-semibold">
        <Trophy /> Ranking info
      </span>
      <Table>
        <TableHeader>
          <TableRow className="bg-[#8B5A2B]/90 hover:bg-[#8B5A2B]">
            <TableHead className="border-x-2 border-white text-white">
              Ranking Agency
            </TableHead>
            <TableHead className="border-x-2 border-white text-white">
              Year & Category
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
          {rankingTitles.flatMap((rankingTitle, agencyIdx) => {
            const agencyRows = agencyToRows[rankingTitle];
            if (agencyRows.length === 0) return [];

            const agencyColor = agencyColors[agencyIdx % agencyColors.length];

            return agencyRows.map((row, idx) => {
              const isEven = idx % 2 === 0;
              const cellBg = isEven ? agencyColor.main : agencyColor.light;

              return (
                <TableRow
                  className={`text-h4 leading-tight`}
                  key={rankingTitle + row.year + (row.category || "")}
                >
                  {idx === 0 && (
                    <TableCell
                      rowSpan={agencyRows.length}
                      className={`border-x-2 text-center border-white font-medium align-middle ${agencyColor.main}`}
                    >
                      <div className="flex justify-center items-center gap-2">
                        {/* Find agency logo from the first ranking of this agency */}
                        {(() => {
                          const agencyRanking = universities
                            .flatMap(
                              (uni) => uni.data?.college?.college_ranking || []
                            )
                            .find((r: any) => r.rank_title === rankingTitle);
                          return agencyRanking?.agency_logo ? (
                            <Image
                              src={agencyRanking.agency_logo}
                              alt={rankingTitle}
                              width={24}
                              height={24}
                              className="w-8 h-8 object-contain"
                            />
                          ) : null;
                        })()}
                        <span className="text-sm">{rankingTitle}</span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell
                    className={`border-x-2 border-white font-medium ${cellBg}`}
                  >
                    {row.label}
                  </TableCell>
                  {universities.map((uni) => {
                    const rankings = uni.data?.college?.college_ranking || [];
                    const ranking = rankings.find(
                      (r: any) =>
                        r.rank_title === rankingTitle &&
                        r.year === row.year &&
                        (row.category ? r.category === row.category : true)
                    );
                    return (
                      <TableCell
                        key={uni.id}
                        className={`border-x-2 border-white text-center ${cellBg}`}
                      >
                        {uni.collegeId
                          ? ranking
                            ? `#${ranking.rank}`
                            : "-"
                          : "-"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            });
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export {
  CourseComparisonTable,
  InstitutionComparisonTable,
  PlacementComparisonTable,
  RankingComparisonTable,
};
