"use client";
import React, { useCallback, useMemo } from "react";
import clsx from "clsx";

interface Stream {
  stream_id: string;
  stream_name: string;
}

interface StreamFilterProps {
  streams: Stream[];
  onStreamSelect: (streamId: string) => void;
  currentFilter: string | null;
  className?: string;
}

export const StreamFilter: React.FC<StreamFilterProps> = React.memo(
  ({ streams, onStreamSelect, currentFilter, className }) => {
    const handleFilterChange = useCallback(
      (streamId: string) => onStreamSelect(streamId),
      [onStreamSelect]
    );

    const filteredStreams = useMemo(
      () => streams.filter((stream) => stream.stream_id !== "0"),
      [streams]
    );

    return (
      <div
        className={clsx(
          "flex flex-row items-center gap-2 overflow-x-auto py-4 no-scroll-bar",
          className
        )}
      >
        {filteredStreams.map((stream) => (
          <div
            key={stream.stream_id}
            onClick={() => handleFilterChange(stream.stream_id)}
            className={clsx(
              "text-sm font-normal whitespace-pre px-4 my-2 ml-1 rounded-full cursor-pointer",
              {
                "bg-primary-main text-white py-1":
                  stream.stream_id === currentFilter,
                "bg-gray-2 text-gray-6": stream.stream_id !== currentFilter,
              }
            )}
          >
            <span className="flex justify-center items-center">
              {stream.stream_name}
            </span>
          </div>
        ))}
      </div>
    );
  }
);

StreamFilter.displayName = "StreamFilter";