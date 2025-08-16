"use client";

import type React from "react";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface FileUploadProps {
  label: string;
  file: File | null | undefined;
  onFileChange: (file: File | null | undefined) => void;
  accept?: string;
}

export function FileUpload({
  label,
  file,
  onFileChange,
  accept = "*/*",
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    onFileChange(selectedFile);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          aria-label="Upload file"
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        {file ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Selected: {file.name}</p>
            <Button
              type="button"
              variant="outline"
              onClick={handleButtonClick}
              className="text-sm bg-transparent"
            >
              Change File
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <Button
              type="button"
              variant="outline"
              onClick={handleButtonClick}
              className="text-sm bg-transparent"
            >
              {label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
