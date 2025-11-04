import React from "react";
import { Review } from "@/types/review";
import { StarRating } from "../star-rating";

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <div className="font-bold mr-2">{review.user?.name || "Anonymous"}</div>
        <StarRating rating={review.overall_satisfaction_rating} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{review.review_title}</h3>
      <p className="text-gray-700 mb-2">{review.overall_experience_feedback}</p>
      <p className="text-gray-500 text-sm">
        {new Date(review.created_at).toLocaleDateString()}
      </p>
    </div>
  );
};

export default ReviewCard;
