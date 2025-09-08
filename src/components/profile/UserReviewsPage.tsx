"use client";
import React, { useEffect } from "react";
import { useReviewsStore } from "@/stores/reviewsStore";
import { useUserStore } from "@/stores/userStore";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const UserReviewsPage = () => {
  const { reviews, isLoading, error, fetchReviews } = useReviewsStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (user?.id && !isNaN(parseInt(user.id, 10))) {
      fetchReviews(parseInt(user.id, 10));
    }
  }, [user?.id, fetchReviews]);

  if (isLoading) {
    return <div>Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Your Reviews</h3>
      {reviews.length === 0 ? (
        <p>You haven't written any reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold">{review.review_title}</h4>
              <div className="flex items-center">
                <span className="mr-1">
                  {/* @ts-ignore */}
                  {review?.overall_satisfaction_rating}
                </span>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {review.overall_experience_feedback}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </Card>
        ))
      )}
    </div>
  );
};

export default UserReviewsPage;
