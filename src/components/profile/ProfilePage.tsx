"use client";
import React from "react";
import BasicDetails from "./BasicDetails";
import EducationDetails from "./EducationDetails";
import WorkExperience from "./WorkExperience";
import EngagementActivity from "./EngagementActivity";

interface ProfilePageProps {
  activeTab: string;
}

const ProfilePage = ({ activeTab }: ProfilePageProps) => {
  return (
    <div className="bg-[#dfebfb]">
      {activeTab === "basic-details" && <BasicDetails />}
      {activeTab === "education-details" && <EducationDetails />}
      {activeTab === "work-experience" && <WorkExperience />}
      {activeTab === "engagement-activity" && <EngagementActivity />}
    </div>
  );
};

export default ProfilePage;
