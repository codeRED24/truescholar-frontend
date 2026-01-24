// Media Preview Grid Component
// Displays uploaded media items in a grid layout
"use client";

import { X, Video, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostMedia } from "../../types";

// Helper type for the specialized uploaded media used in composer
export interface UploadedMedia {
  file?: File;
  previewUrl: string;
  uploadedUrl?: string;
  type?: "image" | "video" | "document";
  isUploading: boolean;
  error?: string;
  // For editing existing posts
  id?: string;
}

interface MediaPreviewGridProps {
  media: UploadedMedia[];
  onRemove: (index: number) => void;
  isReadOnly?: boolean;
}

export function MediaPreviewGrid({
  media,
  onRemove,
  isReadOnly,
}: MediaPreviewGridProps) {
  if (media.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-2 mb-4",
        media.length === 1 && "grid-cols-1",
        media.length === 2 && "grid-cols-2",
        media.length >= 3 && "grid-cols-2"
      )}
    >
      {media.map((item, index) => (
        <div
          key={item.previewUrl || index}
          className={cn(
            "relative rounded-lg overflow-hidden bg-muted flex items-center justify-center group border border-border/40",
            media.length === 1 && "aspect-video",
            media.length >= 2 && "aspect-square"
          )}
        >
          {/* Content */}
          {item.type === "image" || (item.file?.type.startsWith("image/") ?? true) ? (
            <img
              src={item.previewUrl}
              alt={`Preview ${index + 1}`}
              className={cn(
                "w-full h-full object-cover transition-opacity",
                item.isUploading && "opacity-50"
              )}
            />
          ) : item.type === "video" || item.file?.type.startsWith("video/") ? (
            <div className="relative w-full h-full bg-black">
              <video
                src={item.previewUrl}
                className={cn(
                  "w-full h-full object-contain",
                  item.isUploading && "opacity-50"
                )}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Video className="h-8 w-8 text-white/70" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <FileText className="h-10 w-10 text-blue-500" />
              <span className="text-xs font-medium truncate max-w-full px-2">
                {item.file?.name || "Document"}
              </span>
            </div>
          )}

          {/* Overlays */}
          {item.isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
              <Loader2 className="h-8 w-8 animate-spin text-white drop-shadow-md" />
            </div>
          )}

          {item.error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500/80 backdrop-blur-[1px]">
              <div className="text-center px-4">
                <p className="text-white font-semibold text-sm">Upload failed</p>
                <p className="text-white/80 text-xs mt-1">{item.error}</p>
              </div>
            </div>
          )}

          {!isReadOnly && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
