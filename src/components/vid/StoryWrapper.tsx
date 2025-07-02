"use client";
import React from "react";
import dynamic from "next/dynamic";
import StoryTrigger from "./StoryTrigger";

const StoryModal = dynamic(() => import("@/components/vid/StoryModal"), {
  ssr: false,
});

const StoryWrapper: React.FC<{
  videoUrls: string[];
  initialState: "unread" | "read" | "no-story";
  collegeLogo?: string;
  collegeName?: string;
}> = ({ videoUrls, initialState, collegeLogo, collegeName }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [storyState, setStoryState] = React.useState<
    "unread" | "read" | "no-story"
  >(initialState);

  const handleTriggerClick = () => {
    if (storyState === "no-story") return;
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    if (storyState === "unread") setStoryState("read");
  };

  return (
    <>
      <StoryTrigger
        state={storyState}
        onClick={handleTriggerClick}
        imageSrc={collegeLogo}
        altText={collegeName}
      />
      {isModalOpen && (
        <StoryModal
          videoUrls={videoUrls}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

export default StoryWrapper;
