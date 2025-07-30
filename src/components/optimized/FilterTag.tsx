import React from "react";

// Optimized filter tag component
const FilterTag = React.memo(({ 
  label, 
  onRemove, 
  filterKey, 
  value 
}: { 
  label: string; 
  onRemove: (key: string, value?: string) => void;
  filterKey: string;
  value?: string;
}) => (
  <div className="flex items-center bg-[#919EAB1F] text-[#1C252E] text-sm font-medium capitalize px-3 py-1 rounded-2xl">
    {label}
    <button
      onClick={() => onRemove(filterKey, value)}
      className="ml-2 text-xxs bg-[#1C252E] text-white rounded-full p-0.5"
      aria-label={`Remove ${label} filter`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
  </div>
));

FilterTag.displayName = "FilterTag";

export default FilterTag;
