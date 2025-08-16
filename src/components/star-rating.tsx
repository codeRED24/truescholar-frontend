"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
}

export function StarRating({
  rating,
  onRatingChange,
  maxRating = 5,
}: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        return (
          <button
            aria-label={`Rate ${starValue} stars`}
            key={index}
            type="button"
            onClick={() => onRatingChange(starValue)}
            className="transition-colors hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                starValue <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-400"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
