import { CollegeDTO } from "@/api/@types/college-list";
import Image from "next/image";
import React, { useMemo } from "react";
import { TiStarFullOutline } from "react-icons/ti";
import { formatFeeRange } from "../utils/utils";
import Link from "next/link";
import { Headset, Notebook } from "lucide-react";
import { buildCollegeUrl } from "@/lib/seo";

interface CollegeListCardProps {
  college: CollegeDTO;
}

const CollegeListCard: React.FC<CollegeListCardProps> = React.memo(
  ({ college }) => {
    const {
      college_logo,
      college_name = "Unknown College",
      city_name = "Unknown City",
      state_name = "Unknown State",
      kapp_rating = null,
      no_of_courses = 0,
      rankings = {},
      min_fees = null,
      max_fees = null,
      college_id,
      slug,
    } = college;

    const formattedRanking = useMemo(() => {
      if (rankings?.nirf_ranking) {
        return `#${rankings.nirf_ranking} NIRF`;
      } else if (rankings?.times_ranking) {
        return `Times: ${rankings.times_ranking}`;
      } else if (rankings?.india_today_ranking) {
        return `India Today: ${rankings.india_today_ranking}`;
      } else {
        return "-";
      }
    }, [rankings]);

    const renderCollegeStats = useMemo(() => {
      const stats = [
        {
          label: "Rating",
          value: kapp_rating && kapp_rating != "0" ? kapp_rating : "3",
          icon: kapp_rating && (
            <TiStarFullOutline className="inline-block text-primary-3 mr-1" />
          ),
          className: kapp_rating
            ? "text-primary-3 bg-[#22C55E29] px-3 py-0.5 rounded-2xl"
            : "text-gray-500",
        },
        {
          label: "No of courses",
          value: no_of_courses > 0 ? `${no_of_courses}+` : "-",
          className: "text-[#00B8D9]",
        },
        { label: "Ranking", value: formattedRanking },
        {
          label: "Tuition Fees",
          value: formatFeeRange(min_fees, max_fees) ?? "-",
        },
      ];

      return (
        <div className="flex items-center justify-between flex-wrap gap-6 py-2 w-full">
          {stats.map(({ label, value, icon, className }) => (
            <div key={label} className="text-center">
              <p className="text-[#637381] text-xsm">{label}</p>
              <p
                className={`flex items-center justify-center text-sm font-public font-medium mt-1 ${className}`}
              >
                {icon}
                {value}
              </p>
            </div>
          ))}
        </div>
      );
    }, [kapp_rating, no_of_courses, formattedRanking, min_fees, max_fees]);

    return (
      <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-white rounded-3xl shadow-card1 w-full">
        <div className="overflow-hidden relative h-[70px] w-[70px]">
          <Image
            src={
              college_logo ||
              "https://d28xcrw70jd98d.cloudfront.net/allCollegeLogo/defaultLogo1.webp"
            }
            fill
            alt={college_name}
            className="aspect-square size-[70px] rounded-full object-cover p-1.5 bg-white"
            loading="lazy"
          />
        </div>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-dashed pb-4">
            <div>
              <Link
                href={buildCollegeUrl(slug, college_id)}
                className="text-base text-center md:text-left font-semibold font-public line-clamp-1"
              >
                {college_name}
              </Link>
              <p className="text-[#919EAB] font-normal text-md text-center md:text-left">
                {city_name}, {state_name}
              </p>
            </div>
            <div className="flex flex-wrap md:flex-nowrap gap-2 mt-4 md:mt-0">
              <button className="px-3 py-1.5 border rounded-full font-semibold text-xxs md:text-sm flex items-center gap-1 bg-[#00A76F14] hover:bg-[#00A76F29] text-[#007867]">
                Compare <span className="text-md font-light">↑↓</span>
              </button>
              <button className="px-3 py-1.5 border border-[#919EAB52] hover:border-[#DFE3E8] hover:bg-[#F4F6F8] rounded-full font-semibold text-xxs md:text-sm flex items-center gap-1">
                Brochure <Notebook className="text-xs" />
              </button>
              <button className="px-3 py-1.5 border rounded-full font-semibold text-xxs md:text-sm flex items-center gap-1 bg-primary-main hover:bg-primary-3 text-white">
                Enquire <Headset />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            {renderCollegeStats}
          </div>
        </div>
      </div>
    );
  }
);

export default React.memo(CollegeListCard, (prevProps, nextProps) => {
  return (
    JSON.stringify(prevProps.college) === JSON.stringify(nextProps.college)
  );
});
