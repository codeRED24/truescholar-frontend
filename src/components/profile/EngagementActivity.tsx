import React, { useState } from "react";
import { Card } from "../ui/card";
import {
  Flame,
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEngagementActivityStore } from "@/stores/profileStore";
import * as Tooltip from "@radix-ui/react-tooltip";

// Helper function to generate dates for a specific year offset
const getDatesForYear = (yearOffset: number = 0) => {
  const dates = [];
  const today = new Date();
  const startYear = today.getFullYear() - yearOffset;
  const startDate = new Date(startYear, 0, 1); // January 1 of the year
  const endDate = new Date(startYear, 11, 31); // December 31 of the year

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0];
};

const Streak = () => {
  const { engagementActivities } = useEngagementActivityStore();
  const [yearOffset, setYearOffset] = useState<number>(0);

  // Create a set of dates with contributions for quick lookup
  const contributionDates = new Set(
    engagementActivities.map((activity) => activity.date)
  );

  // Calculate current streak
  const calculateStreak = () => {
    let currentStreak = 0;
    const today = new Date();
    let currentDate = new Date(today);

    while (true) {
      const formattedDate = formatDate(currentDate);
      if (contributionDates.has(formattedDate)) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  };

  const currentStreak = calculateStreak();
  const totalContributions = contributionDates.size;
  const dates = getDatesForYear(yearOffset);
  const currentYear = new Date().getFullYear() - yearOffset;

  const handlePrevYear = () => {
    setYearOffset((prev) => Math.min(prev + 1, 5)); // Limit to 5 years back
  };

  const handleNextYear = () => {
    setYearOffset((prev) => Math.max(prev - 1, 0)); // Can't go to future
  };

  return (
    <div>
      <h4 className="text-md font-semibold text-gray-900 mb-2">
        Engagement Streak
      </h4>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-orange-500">
            <Flame className="w-6 h-6 mr-1" />
            <span className="text-xl font-bold">{currentStreak}</span>
            <span className="text-sm ml-1">days</span>
          </div>
          <div className="text-sm text-gray-600">
            Total Contributions: {totalContributions}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevYear}
            disabled={yearOffset === 5}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous year"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[50px] text-center">
            {currentYear}
          </span>
          <button
            onClick={handleNextYear}
            disabled={yearOffset === 0}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next year"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-flow-col grid-rows-7 gap-0.5 p-2 bg-gray-50 rounded-lg border">
        {dates.map((date: Date, index: number) => {
          const formattedDate = formatDate(date);
          const hasContribution = contributionDates.has(formattedDate);
          const isToday = formattedDate === formatDate(new Date());
          const isCurrentMonth =
            date.getMonth() === new Date().getMonth() && yearOffset === 0;
          return (
            <Tooltip.Root key={index}>
              <Tooltip.Trigger asChild>
                <div
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110 ${
                    hasContribution
                      ? isToday
                        ? "bg-green-600 shadow-md"
                        : "bg-green-500 shadow-sm"
                      : isCurrentMonth
                      ? "bg-gray-200"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                />
              </Tooltip.Trigger>
              <Tooltip.Content
                className="bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg"
                side="top"
                sideOffset={5}
              >
                <div className="font-medium">{formattedDate}</div>
                {hasContribution && (
                  <div className="text-green-300">Activity recorded</div>
                )}
              </Tooltip.Content>
            </Tooltip.Root>
          );
        })}
      </div>
    </div>
  );
};

const EngagementActivity = () => {
  return (
    <div className="grid grid-cols-1 md:grid-rows-2 gap-4">
      {/* 1st row */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        <Card className="bg-white shadow p-6 rounded-2xl">
          <Streak />
        </Card>
        <Card className="bg-white shadow p-6 rounded-2xl">
          <h4 className="text-md font-semibold text-gray-900 mb-2">
            Activity Stats
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• Total Reviews: 15</div>
            <div>• Questions Asked: 8</div>
            <div>• Answers Given: 23</div>
            <div>• Comments: 45</div>
          </div>
        </Card>
      </div>
      {/* 2nd row */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        <Card className="bg-white shadow p-6 rounded-2xl">
          <h4 className="text-md font-semibold text-gray-900 mb-2">
            Recent Activities
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• College review posted</div>
            <div>• Question about admissions</div>
            <div>• Helped 3 students</div>
            <div>• Commented on article</div>
          </div>
        </Card>
        <Card className="bg-white shadow p-6 rounded-2xl">
          <h4 className="text-md font-semibold text-gray-900 mb-2">
            Engagement Score
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• Current: 85/100</div>
            <div>• This Week: +12</div>
            <div>• This Month: +28</div>
            <div>• Rank: Top 15%</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EngagementActivity;
