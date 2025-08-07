"use client";
import React, { useState, useEffect, useMemo } from "react";
import { HomeStream } from "@/api/@types/home-datatype";
import dynamic from "next/dynamic";
import Link from "next/link";
import { formatName } from "@/components/utils/utils";
import { StreamFilter } from "@/components/filters/StreamFilter";

const HomeCollegeCard = dynamic(
  () => import("@/components/cards/HomeCollegeCard"),
  {
    ssr: false,
    loading: () => <SkeletonLoader />,
  }
);

const SkeletonLoader = () => (
  <div className="bg-gray-300 h-72 rounded-2xl animate-pulse" />
);

const TopColleges: React.FC<{ data: HomeStream[] }> = ({ data }) => {
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [filteredColleges, setFilteredColleges] = useState<
    HomeStream["colleges"]
  >([]);

  const availableStreams = useMemo(() => {
    return data.filter((stream) => stream?.colleges?.length > 0);
  }, [data]);

  const currentStream = useMemo(() => {
    return selectedStreamId
      ? data.find((stream) => stream.stream_id.toString() === selectedStreamId)
      : availableStreams[0];
  }, [data, selectedStreamId, availableStreams]);

  useEffect(() => {
    const stream = currentStream || availableStreams[0];
    if (stream) {
      setSelectedStreamId(stream.stream_id.toString());
      setFilteredColleges(stream.colleges.slice(0, 6));
    }
  }, [currentStream, availableStreams]);

  if (!data || data.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-body pb-6 md:pb-12">
      <div className="flex justify-between items-center pt-6">
        <h2 className="font-bold lg:text-5xl font-public">
          Top <span className="text-[#919EAB]">Colleges</span>
        </h2>
        <Link
          href={
            currentStream?.stream_name !== "All Streams"
              ? `/colleges-stream-${currentStream?.stream_name
                  .replace(/\s+/g, "")
                  .toLowerCase()}`
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredColleges.map((college) => (
          <div key={college.college_id}>
            <HomeCollegeCard college={college} isLoading={!college} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopColleges;
