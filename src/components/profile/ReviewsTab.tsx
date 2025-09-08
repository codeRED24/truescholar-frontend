"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useReviewsStore } from "../../stores/reviewsStore";
import { useUserStore } from "../../stores/userStore";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  ThumbsUp,
  MessageSquare,
  Calendar,
  Eye,
  Loader,
  LucideMessageCircleQuestion,
  CircleAlert,
  Pen,
} from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";

const ReviewsTab = () => {
  const { reviews, isLoading, error, fetchReviews } = useReviewsStore();
  const { user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      fetchReviews(parseInt(user.id, 10));
    }
  }, [user, fetchReviews]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full bg-slate-50" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const onClickHandler = (): void => {
    router.push("/review-form");
  };

  return (
    <div className="space-y-4 p-4 h-full">
      <h3 className="text-lg font-semibold text-gray-900">Your Reviews</h3>
      {reviews?.length === 0 ? (
        <div className="text-lg text-gray-600 bg-white flex-col space-y-2 w-full rounded-2xl h-[70vh] flex items-center justify-center">
          <CircleAlert className="text-2xl font-bold" />
          <p className="text-2xl font-bold">No reviews found</p>
          <Button
            onClick={onClickHandler}
            className="hover:bg-gray-8 hover:text-white"
          >
            <Pen /> Write your first review{" "}
          </Button>
        </div>
      ) : (
        reviews?.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                {/* <Link
                  href={`/reviews/${review.id}`}
                  className="font-bold text-lg"
                >
                  {review.review_title}
                </Link> */}
                <h2 className="font-bold text-lg">{review.review_title}</h2>
                <p className="text-sm text-gray-600">
                  {review.college
                    ? `${review.college.college_name}`
                    : "College not specified"}
                </p>
              </div>
              <span className="text-xs text-gray-500 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-2 text-gray-800">
              {review.overall_experience_feedback}
            </p>
            {/* <div className="flex items-center justify-end space-x-4 mt-4 text-sm text-gray-600">
              <Button variant="ghost" size="sm" className="flex items-center">
                <ThumbsUp className="w-4 h-4 mr-1" />
                <span>0 Likes</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                <span>0 Comments</span>
              </Button>
            </div> */}
          </Card>
        ))
      )}
    </div>
  );
};

export default ReviewsTab;
