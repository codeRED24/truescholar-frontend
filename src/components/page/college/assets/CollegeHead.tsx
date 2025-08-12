import Share from "@/components/miscellaneous/Share";
import LeadModal from "@/components/modals/LeadModal";
import { Button } from "@/components/ui/button";
import { trimText } from "@/components/utils/utils";
import StoryWrapper from "@/components/vid/StoryWrapper";
import { Headset, LucideArrowDownUp } from "lucide-react";
import Link from "next/link";
import React from "react";
import { GrCatalog } from "react-icons/gr";

const sampleVideoUrls = [
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4",
  "https://download.blender.org/durian/trailer/sintel_trailer-720p.mp4",
  "https://media.xiph.org/video/derf/y4m/ToS_720p.mp4",
  "https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4",
];

const CollegeHead = ({
  data,
}: {
  data: {
    college_name: string;
    college_logo: string;
    city: string;
    state: string;
    title: string;
    location: string;
    college_brochure?: string;
  };
}) => {
  const videoUrls = sampleVideoUrls;
  const initialState = videoUrls.length > 0 ? "unread" : "no-story";
  return (
    <div className="relative bg-college-head text-white pt-16 md:pt-24 pb-6 container-body min-h-60">
      <h2 className="absolute inset-x-0 top-1/4 flex items-center justify-center text-center text-5xl md:text-8xl leading-10 md:leading-ultraWide font-public font-bold text-[#FFFFFF] opacity-20">
        {trimText(data.college_name, 58)}
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
  );
};

export default CollegeHead;
