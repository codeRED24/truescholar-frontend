import { HomeCollege } from "@/api/@types/home-datatype";
import DistanceCollegeCard from "@/components/cards/DistanceCollegeCard";
import Link from "next/link";
import React from "react";

interface DistanceCollegeProps {
  data: HomeCollege[];
}

const DistanceCollege: React.FC<DistanceCollegeProps> = ({ data }) => {
  return (
    <div className="container-body pb-6 md:pb-12">
      <div className="flex justify-between items-center py-6">
        <h2 className="font-bold lg:text-5xl font-public">
          Popular <span className="text-[#919EAB]">Distance Colleges</span>
        </h2>
        <Link href="/colleges" className="text-primary-main font-semibold">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.slice(0, 6).map((college) => (
          <DistanceCollegeCard key={college.college_id} college={college} />
        ))}
      </div>
    </div>
  );
};

export default DistanceCollege;