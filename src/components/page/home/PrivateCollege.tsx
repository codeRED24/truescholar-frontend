"use client";
import React, { memo, useState, useEffect, useMemo } from "react";
import { HomeCollege, HomeStream } from "@/api/@types/home-datatype";
import Link from "next/link";
import Image from "next/image";
import { formatFeeRange, formatName } from "@/components/utils/utils";
import { StreamFilter } from "@/components/filters/StreamFilter";
import { Star } from "lucide-react";

interface PrivateCollegeProps {
  data: HomeStream[];
}

const CollegeRow: React.FC<{ college: HomeCollege }> = memo(({ college }) => {
  const {
    college_name,
    course_count,
    NIRF_ranking,
    city_name,
    logo_img,
    nacc_grade,
    kapp_rating,
    min_tution_fees,
    max_tution_fees,
    slug,
    college_id,
  } = college;

  return (
    <tr className="border-b border-dashed">
      <td className="p-3">
        <div className="flex items-center gap-3">
          <Image
            src={
              logo_img ||
              "https://d28xcrw70jd98d.cloudfront.net/allCollegeLogo/defaultLogo1.webp"
            }
            alt={`${college_name} Logo`}
            width={50}
            height={50}
            className="h-10 w-10 object-cover rounded-full"
          />
          <Link
            href={`/colleges/${slug.replace(/-\d+$/, "")}-${college_id}`}
            className="font-medium min-w-40"
          >
            {college_name}
            <span className="block font-normal text-[#919EAB] text-sm">
              {city_name}
            </span>
          </Link>
        </div>
      </td>
      <td className="p-3">{NIRF_ranking || "-"}</td>
      <td className="p-3 text-[#00B8D9] text-center">
        <span className="font-semibold">{course_count}</span>+
      </td>
      <td className="p-3 text-center">{nacc_grade || "-"}</td>
      <td className="p-3">
        {formatFeeRange(min_tution_fees, max_tution_fees)}
      </td>
      <td className="p-3 text-center">
        {kapp_rating && kapp_rating > 0 ? (
          <span className="text-primary-3 bg-[#22C55E29] font-semibold px-3 py-0.5 rounded-full flex justify-center items-center gap-1 w-fit">
            <Star className="size-4 inline-block fill-primary-3 text-primary-3" />{" "}
            <span>{kapp_rating}</span>
          </span>
        ) : (
          "-"
        )}
      </td>
    </tr>
  );
});
CollegeRow.displayName = "CollegeRow";

const PrivateCollege: React.FC<PrivateCollegeProps> = memo(({ data }) => {
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [filteredColleges, setFilteredColleges] = useState<HomeCollege[]>([]);

  const availableStreams = useMemo(
    () => data.filter((stream) => stream?.colleges?.length > 0),
    [data]
  );

  const currentStream = useMemo(
    () =>
      data.find((stream) => stream.stream_id.toString() === selectedStreamId),
    [data, selectedStreamId]
  );

  useEffect(() => {
    if (data?.length > 0) {
      const firstStream = availableStreams[0];
      if (firstStream) {
        setSelectedStreamId(firstStream.stream_id.toString());
        setFilteredColleges(firstStream.colleges.slice(0, 6));
      }
    }
  }, [data, availableStreams]);

  useEffect(() => {
    if (selectedStreamId && data) {
      const stream = data.find(
        (s) => s.stream_id.toString() === selectedStreamId
      );
      setFilteredColleges(stream?.colleges?.slice(0, 6) || []);
    }
  }, [data, selectedStreamId]);

  if (!data?.length) {
    return (
      <div className="container-body pb-6 md:pb-12">No data available</div>
    );
  }

  return (
    <div className="container-body pb-6 md:pb-12">
      <div className="flex justify-between items-center pt-6">
        <h2 className="font-bold lg:text-5xl font-public">
          Popular <span className="text-[#919EAB]">Private Colleges</span>
        </h2>
        <Link
          href={
            currentStream?.stream_name !== "Top Private Colleges Without Filter"
              ? `/colleges-stream-${currentStream?.stream_name
                  .replace(/\s+/g, "")
                  .toLowerCase()}-type-private`
              : "/colleges"
          }
          className="text-primary-main font-semibold"
        >
          View All
        </Link>
      </div>

      <StreamFilter
        streams={availableStreams.map((stream) => ({
          stream_id: stream.stream_id.toString(),
          stream_name: stream.stream_name,
        }))}
        onStreamSelect={setSelectedStreamId}
        currentFilter={selectedStreamId}
      />

      {filteredColleges.length === 0 ? (
        <p>No data available</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-[#DFE3E8] text-left text-[#637381] text-sm font-semibold">
                <th className="px-3 py-4">College Name</th>
                <th className="px-3 py-4">NIRF Ranking</th>
                <th className="px-3 py-4">No. of courses</th>
                <th className="px-3 py-4">NACC</th>
                <th className="px-3 py-4">Tuition Fees</th>
                <th className="px-3 py-4">Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredColleges.map((college) => (
                <CollegeRow key={college.college_id} college={college} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});
PrivateCollege.displayName = "PrivateCollege";

export default PrivateCollege;
