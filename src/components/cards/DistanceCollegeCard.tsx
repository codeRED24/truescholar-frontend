import { HomeCollege } from "@/api/@types/home-datatype";
import { trimText } from "@/components/utils/utils";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import { TiStarFullOutline } from "react-icons/ti";

interface DistanceCollegeCardProps {
  college: HomeCollege;
}

const DistanceCollegeCard: React.FC<DistanceCollegeCardProps> = ({
  college,
}) => {
  const {
    college_id,
    slug,
    college_name,
    logo_img,
    kapp_rating,
    course_count,
    NIRF_ranking,
  } = college;

  const renderCollegeStats = useMemo(() => {
    const stats = [
      {
        label: "Rating",
        value: kapp_rating ? kapp_rating : 4,
        icon: (
          <TiStarFullOutline className="inline-block text-primary-3 mr-1" />
        ),
        className: "text-primary-3 bg-[#22C55E29] px-3 py-0.5 rounded-full",
      },
      {
        label: "No of courses",
        value: course_count ? `${course_count}+` : "-",
        className: "text-[#00B8D9]",
      },
      {
        label: "Ranking",
        value: NIRF_ranking ? `#${NIRF_ranking} NIRF` : "-",
      },
    ].filter(({ value }) => value != null && value !== 0 && value !== "0");

    return (
      <div className="border-dashed border-y border-[#C8FAD6] p-4 flex justify-between">
        {stats.map(({ label, value, icon, className }) => (
          <div key={label} className="text-center">
            <p className="text-[#637381] text-xsm">{label}</p>
            <p
              className={`flex items-center justify-center font-semibold mt-1 ${className}`}
            >
              {icon && icon}
              {value}
            </p>
          </div>
        ))}
      </div>
    );
  }, [kapp_rating, course_count, NIRF_ranking]);

  return (
    <div className="p-4 bg-white rounded-xl">
      <div className="bg-[#eafff0] rounded-xl">
        <div className="p-4 flex justify-between items-center gap-2">
          <Link
            href={`/colleges/${slug.replace(/-\d+$/, "")}-${college_id}`}
            className="font-semibold text-md"
          >
            {trimText(college_name, 66)}
          </Link>
          <Image
            src={
              logo_img ||
              "https://d28xcrw70jd98d.cloudfront.net/allCollegeLogo/defaultLogo1.webp"
            }
            alt={college_name}
            width={50}
            height={50}
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>
        {renderCollegeStats}
        <div className="p-4">
          <p className="font-semibold text-sm text-white bg-black px-2.5 py-0.5 rounded-full w-fit">
            UGC
          </p>
        </div>
      </div>
    </div>
  );
};

export default DistanceCollegeCard;
