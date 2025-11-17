import { ExamInformationDTO } from "@/api/@types/exam-type";
import LeadModal from "@/components/modals/LeadModal";
import { Button } from "@/components/ui/button";
import { trimText } from "@/components/utils/utils";
import Image from "next/image";
import React from "react";
import { IoHeart, IoShareSocial } from "react-icons/io5";
import { RiCustomerService2Fill } from "react-icons/ri";

interface ExamHeadProps {
  data: ExamInformationDTO;
  title: string;
}

const ExamHead: React.FC<ExamHeadProps> = ({ data, title }) => {
  return (
    <div className="relative bg-exam-head  text-white pt-16 md:pt-28 pb-8 container-body min-h-64">
      <span className="absolute inset-x-0 top-1/4 flex items-center justify-center text-center text-5xl md:text-8xl leading-10 md:leading-ultraWide font-public font-bold text-[#FFFFFF] opacity-20">
        {trimText(data.exam_name, 58)}
      </span>
      <div className="relative z-10 flex items-center flex-col md:flex-row gap-6">
        <Image
          src={
            data.exam_logo ||
            "https://d28xcrw70jd98d.cloudfront.net/allCollegeLogo/defaultLogo1.webp"
          }
          alt={data.exam_name}
          className="w-20 h-20 object-contain rounded-full"
          height={80}
          width={80}
          aria-label="college logo"
        />
        <div className="w-full">
          <div className="flex items-start justify-between md:gap-8 flex-wrap md:flex-nowrap">
            <h1 className="text-xl md:text-2xxl leading-6 md:leading-9 font-public font-bold line-clamp-2">
              {title}
            </h1>
            <div className="flex items-center gap-4 justify-between">
              <Button
                variant="ghost"
                className="px-0 text-primary-1 hover:bg-transparent hover:text-white"
              >
                <IoHeart />
                Favorite
              </Button>
              <Button
                variant="ghost"
                className="px-0 text-primary-1 hover:bg-transparent hover:text-white"
              >
                <IoShareSocial />
                Share
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
            <p className="text-base text-[#919EAB] font-public line-clamp-2">
              {data.exam_description}
            </p>
            <LeadModal
              triggerText={
                <span className="flex items-center gap-2  text-white  py-3 rounded-full shadow-lg">
                  <RiCustomerService2Fill size={24} /> Enquire Now
                </span>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamHead;
