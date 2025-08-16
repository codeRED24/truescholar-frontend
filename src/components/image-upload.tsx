"use client";

import type React from "react";

import { useRef } from "react";
import { Plus, X } from "lucide-react";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 6,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newImages = [...images, ...selectedFiles].slice(0, maxImages);
    onImagesChange(newImages);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        aria-label="Upload images"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              <img
                src={URL.createObjectURL(image) || "/placeholder.svg"}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              aria-label={`Remove image ${index + 1}`}
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            aria-label="Add image"
            type="button"
            onClick={handleAddClick}
            className="aspect-square border-2 border-dashed border-teal-300 rounded-lg flex items-center justify-center hover:border-teal-400 transition-colors"
          >
            <Plus className="w-8 h-8 text-teal-400" />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500">
        {images.length}/{maxImages} images uploaded
      </p>
    </div>
  );
}
