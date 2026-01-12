"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamic import with loading skeleton
const PlacementBarGraph = dynamic(() => import("./PlacementBarGraph"), {
  loading: () => <PlacementBarGraphSkeleton />,
  ssr: false,
});

// Skeleton component for loading state
const PlacementBarGraphSkeleton = () => (
  <div className="w-full py-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
    <div className="h-80 w-full">
      <div className="flex justify-between mb-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
            <span className="w-20 h-3 bg-gray-200 rounded"></span>
          </div>
        ))}
      </div>
      <div className="h-64 bg-gray-100 rounded flex justify-between items-end gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full h-3/4 bg-gray-200 rounded"></div>
            <span className="w-8 h-3 bg-gray-200 rounded"></span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface PlacementData {
  year: number;
  highest_package: number;
  avg_package: number;
  median_package: number;
  placement_percentage: number;
  top_recruiters: string;
}

interface PlacementBarGraphWrapperProps {
  data: PlacementData[];
  title?: string;
  className?: string;
  showTitle?: boolean;
}

const PlacementBarGraphWrapper: React.FC<PlacementBarGraphWrapperProps> = ({
  data,
  title = "Placement Statistics",
  className = "",
  showTitle = true,
}) => {
  // Early return if no data
  if (!data || data.length === 0) {
    return (
      <div className={`w-full py-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p>No placement data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`placement-bar-graph-wrapper ${className}`}>
      {showTitle && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-4">
        <PlacementBarGraph data={data} />
      </div>

      {/* Additional metadata or statistics can be added here */}
      <div className="mt-4 text-sm text-gray-600">
        <p>Data available for {data.length} year(s)</p>
      </div>
    </div>
  );
};

export default PlacementBarGraphWrapper;
