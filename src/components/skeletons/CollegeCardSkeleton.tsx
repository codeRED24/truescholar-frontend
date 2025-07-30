import React from "react";

const CollegeCardSkeleton = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-white rounded-3xl shadow-card1 w-full animate-pulse">
      {/* Logo skeleton */}
      <div className="w-[70px] h-[70px] bg-gray-200 rounded-full flex-shrink-0" />
      
      <div className="flex-1 w-full">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-dashed pb-4">
          <div className="w-full md:w-auto">
            {/* College name */}
            <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
            {/* Location */}
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap md:flex-nowrap gap-2 mt-4 md:mt-0">
            <div className="h-8 bg-gray-200 rounded-full w-20" />
            <div className="h-8 bg-gray-200 rounded-full w-24" />
            <div className="h-8 bg-gray-200 rounded-full w-20" />
          </div>
        </div>
        
        {/* Stats section */}
        <div className="flex items-center justify-between flex-wrap gap-6 py-2 w-full mt-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="text-center">
              <div className="h-3 bg-gray-200 rounded w-12 mb-1" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CollegeCardSkeleton);
