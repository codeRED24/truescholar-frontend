"use client";

import Share from "@/components/miscellaneous/Share";
import LeadModal from "@/components/modals/LeadModal";
import { Button } from "@/components/ui/button";
import { trimText } from "@/components/utils/utils";
import StoryWrapper from "@/components/vid/StoryWrapper";
import { Headset } from "lucide-react";
import React from "react";
import { IoHeart } from "react-icons/io5";

const sampleVideoUrls = [
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4",
  "https://download.blender.org/durian/trailer/sintel_trailer-720p.mp4",
  "https://media.xiph.org/video/derf/y4m/ToS_720p.mp4",
  "https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4",
];

interface NewsData {
  college_information: {
    college_id: number;
    college_name: string;
    logo_img: string;
  };
  news_section: Array<{
    title: string;
    meta_desc: string;
  }>;
  college_logo?: string;
}

interface NewsHeadProps {
  data: NewsData;
}

const NewsHead = ({ data }: NewsHeadProps) => {
  const videoUrls = sampleVideoUrls;
  const initialState = videoUrls.length > 0 ? "unread" : "no-story";

  const collegeName = data.college_information?.college_name || "";
  const collegeLogo =
    data.college_logo || data.college_information?.logo_img || "";
  const newsTitle = data.news_section?.[0]?.title || "";
  const newsDesc = data.news_section?.[0]?.meta_desc || "";

  return (
    <div className="relative bg-college-head text-white pt-16 md:pt-24 pb-6 container-body min-h-60">
      <h2 className="absolute inset-x-0 top-1/4 flex items-center justify-center text-center text-5xl md:text-8xl leading-10 md:leading-ultraWide font-public font-bold text-[#FFFFFF] opacity-20">
        {trimText(collegeName, 58)}
      </h2>
      <div className="relative z-10 flex items-center flex-col md:flex-row gap-6">
        <div>
          <StoryWrapper
            videoUrls={videoUrls}
            initialState={initialState}
            collegeLogo={collegeLogo}
          />
        </div>
        <div className="w-full flex flex-col md:flex-col">
          <div className="w-full flex flex-col md:flex-row">
            <div className="flex flex-col justify-center md:max-w-4/5 w-full md:w-4/5">
              <h1 className="text-xl md:text-3xl leading-6 md:leading-9 font-public font-bold line-clamp-2">
                {newsTitle}
              </h1>
              <p className="line-clamp-2 text-gray-400 text-sm md:text-base">
                {newsDesc}
              </p>
            </div>
            <div className="w-full md:w-1/5 flex flex-col justify-between gap-2 md:max-w-1/5">
              <div className="flex items-center gap-4 justify-start">
                <Button
                  variant="ghost"
                  className="px-0 text-primary-1 hover:bg-transparent hover:text-primary-1"
                >
                  <IoHeart />
                  <span className="ml-1">Favorite</span>
                </Button>
                <Share />
              </div>
              <LeadModal
                triggerText={
                  <span className="flex items-center gap-2">
                    Enquire Now
                    <Headset />
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsHead;
