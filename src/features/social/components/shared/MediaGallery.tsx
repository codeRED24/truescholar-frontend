// Media Gallery Component
// Displays images and videos in a responsive grid

"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { PostMedia } from "../../types";
import { cn } from "@/lib/utils";

interface MediaGalleryProps {
  media: PostMedia[];
  className?: string;
}

export function MediaGallery({ media, className }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (media.length === 0) return null;

  const gridClass = getGridClass(media.length);

  return (
    <>
      <div
        className={cn(
          "grid gap-1 rounded-xl overflow-hidden",
          gridClass,
          className
        )}
      >
        {media.slice(0, 4).map((item, index) => (
          <MediaItem
            key={item.id || item.url || index}
            media={item}
            isLast={index === 3 && media.length > 4}
            remainingCount={media.length - 4}
            onClick={() => setSelectedIndex(index)}
            className={getItemClass(media.length, index)}
          />
        ))}
      </div>

      {/* Lightbox */}
      <Dialog
        open={selectedIndex !== null}
        onOpenChange={() => setSelectedIndex(null)}
      >
        <DialogContent className="max-w-4xl p-0 bg-black/95">
          {selectedIndex !== null && (
            <div className="relative aspect-video">
              {media[selectedIndex].type === "image" ? (
                <Image
                  src={media[selectedIndex].url}
                  alt={media[selectedIndex].altText || ""}
                  fill
                  className="object-contain"
                />
              ) : (
                <video
                  src={media[selectedIndex].url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface MediaItemProps {
  media: PostMedia;
  isLast: boolean;
  remainingCount: number;
  onClick: () => void;
  className?: string;
}

function MediaItem({
  media,
  isLast,
  remainingCount,
  onClick,
  className,
}: MediaItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
        className
      )}
    >
      {media.type === "image" ? (
        <Image
          src={media.url}
          alt={media.altText || ""}
          fill
          className="object-cover hover:scale-105 transition-transform duration-200"
        />
      ) : (
        <>
          <Image
            src={media.thumbnailUrl || media.url}
            alt={media.altText || ""}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-black ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </>
      )}

      {isLast && remainingCount > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <span className="text-white text-2xl font-semibold">
            +{remainingCount}
          </span>
        </div>
      )}
    </button>
  );
}

function getGridClass(count: number): string {
  switch (count) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-2";
    default:
      return "grid-cols-2";
  }
}

function getItemClass(total: number, index: number): string {
  const baseClass = "aspect-square";

  if (total === 1) {
    return "aspect-video";
  }

  if (total === 3 && index === 0) {
    return "row-span-2 aspect-auto h-full";
  }

  return baseClass;
}
