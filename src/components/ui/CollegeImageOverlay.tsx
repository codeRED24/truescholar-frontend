"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollegeImageOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageIndex?: number;
  images: string[];
}

export function CollegeImageOverlay({
  isOpen,
  onClose,
  initialImageIndex = 0,
  images,
}: CollegeImageOverlayProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(initialImageIndex);
    }
  }, [isOpen, initialImageIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevImage();
          break;
        case "ArrowRight":
          goToNextImage();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, currentImageIndex, images]);

  const currentImageUrl = images[currentImageIndex];

  const goToNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const goToPrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  if (!isOpen) {
    return null;
  }

  const renderContent = () => {
    if (!images || images.length === 0) {
      return (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center text-white">
            <p>No images available</p>
          </div>
        </div>
      );
    }

    if (!currentImageUrl) {
      return (
        <div className="flex h-96 items-center justify-center">
          <div className="text-white">
            <p>Image not found</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex max-h-[90vh] max-w-[90vw] flex-col">
        <div className="relative flex-1">
          {imageLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
          <Image
            src={currentImageUrl}
            alt="University image"
            width={1200}
            height={800}
            className="h-auto max-h-[80vh] w-auto max-w-[90vw] rounded-lg object-contain"
            priority
            onLoadStart={() => setImageLoading(true)}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        </div>
      </div>
    );
  };

  const canGoNext = currentImageIndex < images.length - 1;
  const canGoPrev = currentImageIndex > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-10 h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
        aria-label="Close image gallery"
      >
        <X className="h-6 w-6" />
      </Button>

      {canGoPrev && (
        <Button
          onClick={goToPrevImage}
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/20 text-white hover:bg-white/30"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {canGoNext && (
        <Button
          onClick={goToNextImage}
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/20 text-white hover:bg-white/30"
          aria-label="Next image"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {renderContent()}
    </div>
  );
}
