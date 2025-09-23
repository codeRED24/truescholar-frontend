"use client";

import Share from "@/components/miscellaneous/Share";
import LeadModal from "@/components/modals/LeadModal";
import { ReelUploadDialog } from "@/components/reel-upload-dialog";
import { Button } from "@/components/ui/button";
import { trimText } from "@/components/utils/utils";
import StoryWrapper from "@/components/vid/StoryWrapper";
import { Headset, LucideArrowDownUp } from "lucide-react";
import Link from "next/link";
import React from "react";
import { GrCatalog } from "react-icons/gr";
import { IoHeart } from "react-icons/io5";

const sampleVideoUrls = [
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4",
  "https://download.blender.org/durian/trailer/sintel_trailer-720p.mp4",
  "https://media.xiph.org/video/derf/y4m/ToS_720p.mp4",
  "https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4",
];

async function handleReelUpload(
  data: any,
  onProgress?: (progress: number) => void
): Promise<void> {
  if (!data.reel) {
    throw new Error("No reel file provided");
  }
  const formData = new FormData();
  formData.append("user_id", "45");
  formData.append("reel", data.reel);
  formData.append("college_id", data.college_id);
  formData.append("type", data.type);

  // Create XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(percentComplete);
      }
    });

    // Handle completion
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve();
      } else {
        reject(new Error("Upload failed"));
      }
    });

    // Handle errors
    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"));
    });

    // Handle abort
    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled"));
    });

    // Open and send request
    xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/reels`);
    xhr.send(formData);
  });
}

const CollegeHead = ({
  data,
  fromNews = false,
}: {
  data: any;
  fromNews?: boolean;
}) => {
  const videoUrls = sampleVideoUrls;
  const initialState = videoUrls.length > 0 ? "unread" : "no-story";

  if (fromNews) {
    return (
      <div className="relative bg-college-head text-white pt-16 md:pt-24 pb-6 container-body min-h-60">
        <h2 className="absolute inset-x-0 top-1/4 flex items-center justify-center text-center text-5xl md:text-8xl leading-10 md:leading-ultraWide font-public font-bold text-[#FFFFFF] opacity-20">
          {trimText(data.college_information.college_name, 58)}
        </h2>
        <div className="relative z-10 flex items-center flex-col md:flex-row gap-6">
          {/* <Image
          src={
            data.college_logo ||
            "https://d28xcrw70jd98d.cloudfront.net/allCollegeLogo/defaultLogo1.webp"
          }
          alt={data.college_name}
          className="w-20 h-20 object-contain rounded-full"
          height={80}
          width={80}
          aria-label="college logo"
        /> */}
          <div>
            <StoryWrapper
              videoUrls={videoUrls}
              initialState={initialState}
              collegeLogo={data.college_logo}
            />
          </div>
          <div className="w-full flex flex-col md:flex-col">
            <div className="w-full flex flex-col md:flex-row">
              <div className="flex flex-col justify-center md:max-w-4/5 w-full md:w-4/5">
                <h1 className="text-xl md:text-3xl leading-6 md:leading-9 font-public font-bold line-clamp-2">
                  {data.news_section[0].title}
                </h1>
                <p className="line-clamp-2 text-gray-400 text-sm md:text-base">
                  {data.news_section[0].meta_desc}
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
  }

  return (
    <div className="relative bg-college-head text-white pt-16 md:pt-24 pb-6 container-body min-h-60">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-1/4 flex items-center justify-center text-center text-5xl md:text-8xl leading-10 md:leading-ultraWide font-public font-bold text-[#FFFFFF] opacity-20"
      >
        {trimText(data.college_name, 58)}
      </span>
      <div className="relative z-10 flex items-center flex-col md:flex-row gap-6">
        {/* <Image
          src={
            data.college_logo ||
            "https://d28xcrw70jd98d.cloudfront.net/allCollegeLogo/defaultLogo1.webp"
          }
          alt={data.college_name}
          className="w-20 h-20 object-contain rounded-full"
          height={80}
          width={80}
          aria-label="college logo"
        /> */}
        <div>
          <StoryWrapper
            videoUrls={videoUrls}
            initialState={initialState}
            collegeLogo={data.college_logo}
          />
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between md:gap-4 flex-wrap">
            <p className="text-base text-[#919EAB] font-public">
              {data.city && data.state ? (
                <>
                  <Link
                    href={`/colleges-city-${data.city
                      .replace(/\s+/g, "")
                      .toLowerCase()}`}
                  >
                    <span className="text-primary-1 hover:underline">
                      {data.city}
                    </span>
                  </Link>
                  {", "}
                  <Link
                    href={`/colleges-state-${data.state
                      .replace(/\s+/g, "")
                      .toLowerCase()}`}
                  >
                    <span className="text-primary-1 hover:underline">
                      {data.state}
                    </span>
                  </Link>
                </>
              ) : (
                data.location
              )}
            </p>

            <div className="flex items-center gap-4 justify-between">
              <Button
                variant="ghost"
                className="px-0 text-primary-1 hover:bg-transparent hover:text-white"
              >
                <LucideArrowDownUp />
                Compare
              </Button>
              {/* <Button
                variant="ghost"
                className="px-0 text-primary-1 hover:bg-transparent hover:text-white"
              >
                <IoHeart />
                Favorite
           
              </Button> */}
              <LeadModal
                btnVariant="ghost"
                brochureUrl={data.college_brochure}
                triggerText={
                  <span className="flex items-center gap-2">
                    <GrCatalog />
                    Brochure
                  </span>
                }
              />
              {/* <Button
                variant="ghost"
                className="px-0 text-primary-1 hover:bg-transparent hover:text-white"
              >
                <IoShareSocial />
                Share
              </Button> */}
              <Share />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
            <h1 className="text-xl md:text-2xxl leading-6 md:leading-9 font-public font-bold line-clamp-2">
              {data.title || data.college_name}
            </h1>
            <div className="flex-1 lg:flex-none  flex flex-col lg:flex-row gap-2">
              <ReelUploadDialog
                collegeId={data.college_id}
                onUpload={handleReelUpload}
              />
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

export default CollegeHead;
