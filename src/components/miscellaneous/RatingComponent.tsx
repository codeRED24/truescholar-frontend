"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { getCurrentLocation, getCurrentUrl } from "../utils/utils";

const NPSModal = dynamic(() => import("../modals/NPSModal"), { ssr: false });

const RatingComponent: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const responseUrl = getCurrentUrl();
  const location = getCurrentLocation();

  const reactionImg = useMemo(
    () => [
      { bg: "[#1C252E]", emoji: "😣", rating: 1 },
      { bg: "[#1C252E]", emoji: "😕", rating: 2 },
      { bg: "[#1C252E]", emoji: "😊", rating: 3 },
      { bg: "[#1C252E]", emoji: "😎", rating: 4 },
      { bg: "[#1C252E]", emoji: "😍", rating: 5 },
    ],
    []
  );

  const handleReactionClick = (rating: number) => {
    setSelectedRating(rating);
    setModalOpen(true);
  };

  return (
    <div className="bg-primary-3 flex flex-col items-center justify-center p-4 rounded-2xl mb-4 mt-4 sm:mt-2">
      <p className="mb-4 text-base md:text-xl font-public text-white">
        How would you{" "}
        <span className="uppercase font-medium">rate your experience</span> with
        this page up to now?
      </p>
      <div className="flex space-x-4">
        {reactionImg.map(({ bg, emoji, rating }) => (
          <div
            key={rating}
            className="transform transition-transform duration-300 ease-in-out group cursor-pointer"
            onClick={() => handleReactionClick(rating)}
          >
            <div
              className={`bg-${bg} rounded-full w-12 md:w-16 h-12 md:h-16 flex items-center justify-center rating-shadow`}
            >
              <p className="text-4xl md:text-5xl group-hover:-translate-y-4 group-hover:scale-125 transition-transform duration-300">
                {emoji}
              </p>
            </div>
          </div>
        ))}
      </div>
      {modalOpen && selectedRating !== null && (
        <NPSModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          rating={selectedRating}
          response_url={responseUrl}
          location={location}
        />
      )}
    </div>
  );
};

export default RatingComponent;
