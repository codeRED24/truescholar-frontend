"use client";
import React from "react";
import BasicDetails from "./BasicDetails";
import BasicEducationPage from "./BasicEducationPage";
import ReviewsTab from "./ReviewsTab";

interface ProfilePageProps {
  activeTab: string;
}

const ProfilePage = ({ activeTab }: ProfilePageProps) => {
  return (
    <div className="bg-[#dfebfb]">
      {activeTab === "basic-details" && <BasicDetails />}
      {activeTab === "education-details" && <BasicEducationPage />}
      {activeTab === "reviews" && <ReviewsTab />}
      {/*  {activeTab === "work-experience" && <WorkExperience />}
      {activeTab === "engagement-activity" && <EngagementActivity />} */}
    </div>
  );
};

export default ProfilePage;
