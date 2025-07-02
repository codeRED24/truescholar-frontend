import React, { useMemo } from "react";
import { HomeCollege } from "@/api/@types/home-datatype";
import Image from "next/image";
import { TiStarFullOutline } from "react-icons/ti";
import { trimText } from "../utils/utils";
import Link from "next/link";

const SkeletonLoader = () => (
  <div className="bg-gray-300 h-72 rounded-2xl animate-pulse" />
);

const HomeCollegeCard: React.FC<{ college?: HomeCollege; isLoading: boolean }> = React.memo(({ college, isLoading }) => {
  if (isLoading) {
    return <SkeletonLoader />;
  }

  const { kapp_rating, course_count, NIRF_ranking, college_name, city_name, logo_img, nacc_grade, college_id, slug } = college!;
  const renderCollegeStats = useMemo(() => (
    <div className="border-dashed border-y border-[#DFE3E8] p-4 flex justify-around">
      {[
        { label: "Rating", value: kapp_rating, icon: <TiStarFullOutline className="inline-block text-primary-3 mr-1" />, className: "text-primary-3 bg-[#22C55E29] px-3 py-0.5 rounded-full" },
        { label: "No of courses", value: course_count ? `${course_count}+`:"-", className: "text-[#00B8D9]" },
        { label: "Ranking", value: NIRF_ranking ? `#${NIRF_ranking} NIRF` : null }
      ]
        .filter(({ value }) => value != null && value !== 0 && value !== '0')
        .map(({ label, value, icon, className }) => (
          <div key={label} className="text-center">
            <p className="text-[#637381] text-sm">{label}</p>
            <p className={`flex items-center justify-center font-public font-medium mt-1 ${className}`}>
              {icon && icon}
              {value}
            </p>
          </div>
        ))}
    </div>
  ), [kapp_rating, course_count, NIRF_ranking]);


  return (
    <div className="bg-white rounded-2xl">
      <div className="bg-black h-12 rounded-t-2xl"></div>
      <div className="flex items-center justify-center flex-col py-2">
        <Image
          src={logo_img || "https://d28xcrw70jd98d.cloudfront.net/allCollegeLogo/defaultLogo1.webp"}
          width={70}
          height={70}
          alt={college_name}
          className="aspect-square rounded-full object-cover p-1.5 bg-white -mt-10"
        />
        <Link href={`/colleges/${slug.replace(/-\d+$/, "")}-${college_id}`} className="font-public font-bold text-md text-center">{trimText(college_name, 46)}</Link>
        <p className="text-sm text-[#637381]">{city_name}</p>
      </div>
      {renderCollegeStats}
      <div className="flex justify-center items-center gap-4 py-4">
        <p className="px-3 py-0.5 bg-black text-white font-semibold rounded-full text-center">UGC</p>
        {nacc_grade && (<p className="px-3 py-0.5 bg-black text-white font-semibold rounded-full text-center min-w-14">{nacc_grade}</p>)}
      </div>
    </div>
  );
});

export default HomeCollegeCard;
