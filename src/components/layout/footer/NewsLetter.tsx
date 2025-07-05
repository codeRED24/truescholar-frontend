import { Headset } from "lucide-react";
import dynamic from "next/dynamic";
import React from "react";
const LeadModal = dynamic(() => import("@/components/modals/LeadModal"));

const NewsLetter = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 py-6">
      <div className="col-span-1">
        <p className="text-white font-sans font-bold text-7xl">
          Confusion chhodo, <span className="text-primary-1">EXPERT</span> ki
          suno
        </p>
        <LeadModal
          triggerText={
            <span className="flex items-center gap-2">
              <Headset /> Get FREE counselling!
            </span>
          }
        />
      </div>
      <div className="col-span-1 font-semibold text-white text-lg space-y-4 flex justify-center flex-col">
        <p>
          <span className="text-primary-1">Personalized </span> College & Course
          Recommendations
        </p>
        <p>
          Expert <span className="text-primary-1"> Counselling </span>Services
        </p>
        <p>
          In-Depth <span className="text-primary-1"> College Comparisons</span>
        </p>
        <p>
          <span className="text-primary-1">Scholarship </span>Assistance
        </p>
      </div>
    </div>
  );
};

export default NewsLetter;
