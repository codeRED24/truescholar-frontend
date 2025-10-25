"use client";
import dynamic from "next/dynamic";
import { getReviewsByCollegeId } from "@/api/individual/getReviewsByCollegeId";
import { useState, useEffect, useCallback } from "react";
import { ReviewSkeleton } from "./ReviewSkeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import { GraduationCap, Briefcase, Building, Users } from "lucide-react";
import { Review } from "@/types/review";
import { Skeleton } from "@/components/ui/skeleton";

const AggregatedReviewCard = dynamic(
  () =>
    import("@/components/cards/AggregatedReviewCard").then(
      (mod) => mod.AggregatedReviewCard
    ),
  {
    loading: () => <Skeleton className="h-[370px]" />,
  }
);

const IndividualReview = dynamic(
  () =>
    import("@/components/page/college/assets/IndividualReview").then(
      (mod) => mod.IndividualReview
    ),
  { loading: () => <Skeleton className="h-[370px]" /> }
);

interface ReviewsContentProps {
  collegeId: number;
  collegeName: string;
}

interface AggregatedRatings {
  overall_satisfaction_rating: number;
  teaching_quality_rating: number;
  infrastructure_rating: number;
  library_rating: number;
  placement_support_rating: number;
  administrative_support_rating: number;
  hostel_rating: number;
  extracurricular_rating: number;
  ratingBreakdown: {
    stars: number;
    percentage: number;
  }[];
}

export default function ReviewsContent({
  collegeId,
  collegeName,
}: ReviewsContentProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [aggregatedRatings, setAggregatedRatings] =
    useState<AggregatedRatings | null>(null);
  const limit = 5;
  const [totalReviews, setTotalReviews] = useState(0);

  const fetchReviews = useCallback(
    async (pageNum: number) => {
      setError(null);

      try {
        const data = await getReviewsByCollegeId(collegeId, pageNum, limit);
        if (data && data.data) {
          setReviews((prev) => [...prev, ...data.data]);
          setHasMore(data.data.length === limit);
          setTotalReviews(data.total);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [collegeId]
  );

  const fetchAggregatedRatings = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/college/${collegeId}/ratings`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch aggregated ratings");
      }
      const data = await response.json();
      setAggregatedRatings(data);
    } catch (err) {
      console.error(err);
    }
  }, [collegeId]);

  useEffect(() => {
    fetchReviews(page);
  }, [fetchReviews, page]);

  useEffect(() => {
    fetchAggregatedRatings();
  }, [fetchAggregatedRatings]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="space-y-10">
        {Array.from({ length: 3 }).map((_, index) => (
          <ReviewSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return null;
  }

  const categoryRatings = aggregatedRatings
    ? [
        {
          name: "Academic",
          rating: aggregatedRatings.teaching_quality_rating,
          icon: <GraduationCap className="h-5 w-5" />,
        },
        {
          name: "Infrastructure",
          rating: aggregatedRatings.infrastructure_rating,
          icon: <Building className="h-5 w-5" />,
        },
        {
          name: "Placement",
          rating: aggregatedRatings.placement_support_rating,
          icon: <Briefcase className="h-5 w-5" />,
        },
        {
          name: "Accommodation",
          rating: aggregatedRatings.hostel_rating,
          icon: <Users className="h-5 w-5" />,
        },
        {
          name: "Social Life",
          rating: aggregatedRatings.extracurricular_rating,
          icon: <Users className="h-5 w-5" />,
        },
      ]
    : [];

  return (
    <div>
      <div className="mt-4 mb-4 bg-white p-6 rounded-lg">
        <h2 className="text-brand-primary mb-4 text-start text-xl font-semibold">
          Why Choose <span className="text-primary-main">{collegeName}?</span>
        </h2>
        {aggregatedRatings && (
          <AggregatedReviewCard
            collegeId={collegeId}
            rating={aggregatedRatings.overall_satisfaction_rating || 0}
            totalReviews={totalReviews}
            ratingBreakdown={aggregatedRatings.ratingBreakdown || []}
            categoryRatings={categoryRatings}
          />
        )}
      </div>

      {reviews.length > 0 && (
        <div className="bg-white p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          <InfiniteScroll
            dataLength={reviews.length}
            next={loadMore}
            hasMore={hasMore}
            loader={<ReviewSkeleton />}
          >
            <div className="space-y-10">
              {reviews.map((review) => (
                <IndividualReview key={review.id} review={review} />
              ))}
            </div>
          </InfiniteScroll>
        </div>
      )}
    </div>
  );
}
