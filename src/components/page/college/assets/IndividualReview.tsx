import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Star,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  User,
  Quote,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Review } from "@/types/review";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { CollegeImageOverlay } from "@/components/ui/CollegeImageOverlay";
import { humanize } from "inflection";

interface IndividualReviewProps {
  review: Review;
}

const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <div key={i} className="relative">
          <Star className="h-4 w-4 text-gray-300" />
          <Star
            className="absolute inset-0 h-4 w-4 fill-yellow-500 text-yellow-500"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </div>
      );
    } else {
      stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
    }
  }

  return <div className="flex items-center gap-1">{stars}</div>;
};

export const IndividualReview = ({ review }: IndividualReviewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollegeOverlayOpen, setIsCollegeOverlayOpen] = useState(false);

  const openCollegeImageOverlay = () => {
    setIsCollegeOverlayOpen(true);
  };

  const closeCollegeImageOverlay = () => {
    setIsCollegeOverlayOpen(false);
  };

  const additionalRatings = [
    {
      name: "Teaching Quality",
      rating: review.teaching_quality_rating,
      comment: review.teaching_quality_feedback,
    },
    {
      name: "Infrastructure",
      rating: review.infrastructure_rating,
      comment: review.infrastructure_feedback,
    },
    {
      name: "Library",
      rating: review.library_rating,
      comment: review.library_feedback,
    },
    {
      name: "Placement Support",
      rating: review.placement_support_rating,
      comment: review.placement_support_feedback,
    },
    {
      name: "Administrative Support",
      rating: review.administrative_support_rating,
      comment: review.administrative_support_feedback,
    },
    {
      name: "Hostel",
      rating: review.hostel_rating,
      comment: review.hostel_feedback,
    },
    {
      name: "Extracurricular Activities",
      rating: review.extracurricular_rating,
      comment: review.extracurricular_feedback,
    },
  ];

  return (
    <div className="">
      <Card className="gap-0 rounded-xl bg-[#F6F6F7] pb-0 pt-6 shadow-none hover:shadow-none">
        <div className="px-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gray-400 text-white">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-brand-primary text-base font-semibold">
                    {review.user?.name || "Anonymous"}
                  </h3>
                  <div className="hidden gap-2 sm:flex">
                    <StarRating rating={review.overall_satisfaction_rating} />
                    <span className="font-semibold text-foreground">
                      {review.overall_satisfaction_rating}/5
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-5">
                  Student{" "}
                  {review.stream && <span>at {humanize(review.stream)}</span>}
                </p>
              </div>
            </div>
            <div className="text-[#D8D8DC]">
              <Quote className="h-10 w-10" fill="currentColor" />
            </div>
          </div>
          <h4
            className={cn(
              "mb-4 text-xl font-semibold text-gray-6",
              !isExpanded && "line-clamp-2 hidden sm:block md:line-clamp-1"
            )}
          >
            {review.review_title}
          </h4>
          <div className="mb-2 hidden items-center gap-2 sm:flex">
            <div className="bg-primary-main flex items-center gap-1 rounded-full px-3 py-1 text-sm text-white">
              <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
              {review.overall_satisfaction_rating}
            </div>
            <span className="text-primary-main font-semibold text-xl">
              Overall Satisfaction
            </span>
          </div>
          <p
            className={cn(
              "mb-6 text-lg font-normal text-foreground",
              !isExpanded && "line-clamp-3"
            )}
          >
            {review.overall_experience_feedback}
          </p>

          {isExpanded && additionalRatings.length > 0 && (
            <div className="mb-6 space-y-4">
              {additionalRatings.map((category, index) => (
                <div key={index}>
                  {index > -1 && <Separator className="mb-4" />}
                  <div className="mb-2 flex items-center gap-2">
                    <div className="bg-primary-main flex items-center gap-1 rounded-full px-3 py-1 text-sm text-white">
                      <Star
                        className="h-4 w-4 text-yellow-500"
                        fill="currentColor"
                      />
                      {category.rating}
                    </div>
                    <span className="text-primary-main font-semibold text-xl">
                      {category.name}
                    </span>
                  </div>
                  <p className="text-lg font-normal text-foreground">
                    {category.comment}
                  </p>
                </div>
              ))}
              <Separator className="mb-6" />
              {review.improvement_suggestions && (
                <div className="mb-6 space-y-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ThumbsUp className="text-primary-main h-5 w-5" />
                    <span className="text-primary-main font-semibold text-xl">
                      Improvement Suggestions
                    </span>
                  </div>
                  <p className="text-lg font-normal text-foreground">
                    {review.improvement_suggestions}
                  </p>
                </div>
              )}
              {review.college_images_urls &&
                review.college_images_urls.length > 0 && (
                  <div className="mb-6">
                    <Separator className="mb-6" />
                    <div className="mb-4 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-primary-main" />
                      <h3 className="text-primary-main font-semibold text-xl">
                        Shared University Images
                      </h3>
                    </div>
                    <div
                      className={cn(
                        "group relative size-48 overflow-hidden rounded-lg border border-gray-200",
                        review.college_images_urls.length > 0 &&
                          "cursor-pointer"
                      )}
                      onClick={() => {
                        if (review.college_images_urls.length > 0) {
                          openCollegeImageOverlay();
                        }
                      }}
                    >
                      <Image
                        src={review.college_images_urls[0]}
                        alt="University image"
                        width={300}
                        height={200}
                        className={cn(
                          "h-48 w-full object-cover transition-transform duration-300",
                          review.college_images_urls.length > 0 &&
                            "group-hover:scale-110"
                        )}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"></div>
                      {review.college_images_urls.length > 1 && (
                        <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                          +{review.college_images_urls.length - 1} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-auto w-full items-center focus:outline-none justify-center rounded-b-xl bg-[#ECECEE] p-2 text-[#9D9D9D] transition-colors hover:bg-[#dededf] hover:text-foreground"
        >
          {isExpanded ? "Show Less" : "Read Full Review"}
          {isExpanded ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          )}
        </button>
      </Card>
      <div className="flex items-center justify-between pt-3">
        <span className="text-sm text-gray-5 font-medium">
          Posted On : {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>
      {review.college_images_urls?.length > 0 && (
        <CollegeImageOverlay
          isOpen={isCollegeOverlayOpen}
          onClose={closeCollegeImageOverlay}
          images={review.college_images_urls}
        />
      )}
    </div>
  );
};
