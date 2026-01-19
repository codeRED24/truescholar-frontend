import React, { useMemo } from "react";
import { HomeCollege } from "@/api/@types/home-datatype";
import Image from "next/image";
import { trimText } from "../utils/utils";
import Link from "next/link";
import { Star } from "lucide-react";
import { buildCollegeUrl } from "@/lib/seo";

const SkeletonLoader = () => (
  <div className="bg-gray-300 h-72 rounded-2xl animate-pulse" />
);

const HomeCollegeCard: React.FC<{ college?: HomeCollege; isLoading: boolean }> =
  React.memo(({ college, isLoading }) => {
    if (isLoading) {
      return <SkeletonLoader />;
    }

    const {
      kapp_rating,
      course_count,
      NIRF_ranking,
      college_name,
      city_name,
      logo_img,
      nacc_grade,
      college_id,
      slug,
    } = college!;
    const renderCollegeStats = useMemo(
      () => (
        <div className="border-dashed border-y border-[#DFE3E8] p-4 flex justify-around">
          {[
            {
              label: "Rating",
              value: kapp_rating,
              icon: (
                <Star className="size-3 inline-block text-primary-3 fill-primary-3 mr-1" />
              ),
              className:
                "text-primary-3 bg-[#22C55E29] px-3 py-0.5 rounded-full",
            },
            {
              label: "No of courses",
              value: course_count ? `${course_count}+` : "-",
              className: "text-[#00B8D9]",
            },
            {
              label: "Ranking",
              value: NIRF_ranking ? `#${NIRF_ranking} NIRF` : null,
            },
          ]
            .filter(
              ({ value }) => value != null && value !== 0 && value !== "0"
            )
            .map(({ label, value, icon, className }) => (
              <div key={label} className="text-center">
                <p className="text-[#637381] text-sm">{label}</p>
                <p
                  className={`flex items-center justify-center font-public font-medium mt-1 ${className}`}
                >
                  {icon && icon}
                  {value}
                </p>
              </div>
            ))}
        </div>
      ),
      [kapp_rating, course_count, NIRF_ranking]
    );

    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        {/* Top black bar */}
        <div className="bg-black h-12 w-full relative flex justify-center items-center">
          {/* Centered logo, overlapping the black bar */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 z-10">
            <Image
              src={
                logo_img ||
                "https://d28xcrw70jd98d.cloudfront.net/allCollegeLogo/defaultLogo1.webp"
              }
              width={70}
              height={70}
              alt={college_name}
              className="aspect-square size-16 rounded-full object-cover p-1.5 bg-white border border-[#E0E0E0] shadow-md"
            />
          </div>
        </div>
        {/* Heading and city */}
        <div className="flex flex-col items-center justify-center pt-10 pb-2 px-2">
          <Link
            href={buildCollegeUrl(slug, college_id)}
            className="font-public font-bold text-base text-center leading-tight my-1"
          >
            {trimText(college_name, 46)}
          </Link>
          {city_name && (
            <p className="text-xs text-[#637381] mt-0.5">{city_name}</p>
          )}
        </div>
        {renderCollegeStats}
        <div className="flex justify-center items-center gap-4 py-4">
          <p className="px-3 py-0.5 bg-black text-white font-semibold rounded-full text-center">
            UGC
          </p>
          {nacc_grade && (
            <p className="px-3 py-0.5 bg-black text-white font-semibold rounded-full text-center min-w-14">
              {nacc_grade}
            </p>
          )}
        </div>
      </div>
    );
  });

export default HomeCollegeCard;
