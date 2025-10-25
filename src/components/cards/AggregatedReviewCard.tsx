import type React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import Link from "next/link";

interface RatingBreakdown {
  stars: number;
  percentage: number;
}

interface CategoryRating {
  name: string;
  rating: number;
  icon: React.ReactNode;
}

interface ReviewCardProps {
  collegeId: number;
  rating: number;
  totalReviews: number;
  ratingBreakdown: RatingBreakdown[];
  categoryRatings: CategoryRating[];
  className?: string;
}

const StarRating = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star
          key={i}
          className={cn(
            "fill-yellow-500 text-yellow-500",
            size === "lg" ? "h-5 w-5" : "h-4 w-4"
          )}
        />
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <div key={i} className="relative">
          <Star
            className={cn(
              "text-gray-300",
              size === "lg" ? "h-5 w-5" : "h-4 w-4"
            )}
          />
          <Star
            className={cn(
              "absolute inset-0 fill-yellow-500 text-yellow-500",
              size === "lg" ? "h-5 w-5" : "h-4 w-4"
            )}
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </div>
      );
    } else {
      stars.push(
        <Star
          key={i}
          className={cn("text-gray-300", size === "lg" ? "h-5 w-5" : "h-4 w-4")}
        />
      );
    }
  }

  return <div className="flex items-center gap-1">{stars}</div>;
};

const chartConfig = {
  percentage: {
    label: "Percentage",
    color: "#0000FF",
  },
} satisfies ChartConfig;

export function AggregatedReviewCard({
  collegeId,
  rating,
  totalReviews,
  ratingBreakdown,
  categoryRatings,
  className,
}: ReviewCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-xl bg-[#F6F6F7] pl-6 shadow-none hover:shadow-none",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col lg:flex-row",
          totalReviews === 0 ? "pointer-events-none blur-sm" : ""
        )}
      >
        <div className="flex-1 p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <StarRating rating={rating} size="lg" />
                <span className="text-2xl font-bold text-foreground">
                  {rating}/5
                </span>
              </div>
              <span className="text-muted-foreground">
                ({totalReviews} Verified Reviews)
              </span>
            </div>
            {totalReviews > 0 && (
              <Link href="/review-form" target="_blank">
                <Button>Write a Review</Button>
              </Link>
            )}
          </div>

          <div className="mb-8 flex flex-wrap justify-center gap-2 sm:justify-start">
            {ratingBreakdown.map((item) => (
              <ChartContainer
                key={item.stars}
                config={chartConfig}
                className="aspect-square h-20 w-20"
              >
                <RadialBarChart
                  data={[item]}
                  startAngle={270}
                  endAngle={270 - 360 * (item.percentage / 100)}
                  innerRadius={35}
                  outerRadius={40}
                >
                  <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                    className="first:fill-muted last:fill-background"
                    polarRadius={[36, 34]}
                  />
                  <RadialBar
                    dataKey="percentage"
                    background
                    cornerRadius={10}
                    fill="#00A76F"
                  />
                  <PolarRadiusAxis
                    tick={false}
                    tickLine={false}
                    axisLine={false}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <g>
                              <text
                                x={(viewBox.cx || 0) - 4}
                                y={(viewBox.cy || 0) - 5}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-foreground text-lg font-bold"
                              >
                                {item.stars}
                              </text>
                              <svg
                                x={(viewBox.cx || 0) + 3}
                                y={(viewBox.cy || 0) - 15}
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="#EAB308"
                                stroke="#EAB308"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polygon points="12 2 15.09 10.26 24 10.5 17.18 16.34 19.34 24.5 12 20.31 4.66 24.5 6.82 16.34 0 10.5 8.91 10.26 12 2"></polygon>
                              </svg>
                              <text
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 15}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-muted-foreground text-xs"
                              >
                                ({item.percentage}%)
                              </text>
                            </g>
                          );
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ChartContainer>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryRatings.map((category) => (
              <div
                key={category.name}
                className="flex items-center gap-3 overflow-hidden bg-white border p-2"
              >
                <div className="flex-1">
                  <div className="text-brand-secondary mb-1 flex items-center gap-2">
                    {category.icon}
                    <span className="font-semibold text-foreground">
                      {category.rating}
                    </span>
                    <Star
                      className="h-4 w-4 text-yellow-500"
                      fill="currentColor"
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-6">
                    {category.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {totalReviews === 0 && (
        <Link
          href="/review-form"
          target="_blank"
          className="absolute left-1/2 top-1/2 z-[15] flex w-fit -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        >
          <Button size={"lg"}>Write a Review</Button>
        </Link>
      )}
    </Card>
  );
}
