import React from "react";
import UpdateModal from "@/components/modals/UpdateModal";
import { BellRing } from "lucide-react";

const NewsletterSignup: React.FC = () => {
  return (
    <div className="mb-10">
      <div className="flex w-full justify-center items-center">
        <svg
          viewBox="0 0 1000 150"
          width="100%"
          height="auto"
          className="max-w-full h-auto  hidden sm:flex"
        >
          <text
            x="500"
            y="150"
            textAnchor="middle"
            className="text-[30vw] sm:text-[12vw] md:text-[120px] font-public font-bold"
            style={{
              fill: "none",
              stroke: "rgba(255, 255, 255, 0.05)", // more opaque for bolder look
              strokeWidth: 2, // thicker stroke for bolder effect
              strokeDasharray: "3 3",
            }}
          >
            TRUESCHOLAR
          </text>
        </svg>
      </div>
      <div className="bg-[#21272C] rounded-lg lg:rounded-full py-4 px-6 flex flex-col lg:flex-row items-center justify-between w-full  mx-auto">
        <span className="text-white font-semibold text-lg mb-4 md:mb-0 md:mr-8">
          Sign up for daily updates
        </span>
        <UpdateModal
          triggerText={
            <>
              <BellRing size={14} fill="#fff" />
              Subscribe
            </>
          }
        />
      </div>
    </div>
  );
};

export default NewsletterSignup;
