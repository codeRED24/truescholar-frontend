"use client";

import { cn } from "@/lib/utils";

interface EventImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  aspectRatio?: "video" | "square" | "portrait";
}

export function EventImage({ src, alt, className, aspectRatio = "video" }: EventImageProps) {
  const aspectClass = 
    aspectRatio === "video" ? "aspect-video" : 
    aspectRatio === "square" ? "aspect-square" : 
    "aspect-[3/4]";

  if (src) {
    return (
      <div className={cn("overflow-hidden relative bg-muted rounded-md", aspectClass, className)}>
        <img 
          src={src} 
          alt={alt} 
          className="object-cover w-full h-full transition-transform hover:scale-105 duration-300"
        />
      </div>
    );
  }

  return (
    <div className={cn("w-full bg-muted flex items-center justify-center text-muted-foreground rounded-md", aspectClass, className)}>
      <span className="text-4xl opacity-50">📅</span>
    </div>
  );
}
