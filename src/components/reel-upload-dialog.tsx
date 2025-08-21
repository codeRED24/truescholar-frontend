"use client";

import type React from "react";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Upload, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelUploadData {
  reel: File | null;
  college_id: number;
  type: string;
}

interface ReelUploadDialogProps {
  collegeId: number;
  onUpload?: (
    data: ReelUploadData,
    onProgress?: (progress: number) => void
  ) => Promise<void>;
  children?: React.ReactNode;
}

export function ReelUploadDialog({
  collegeId,
  onUpload,
  children,
}: ReelUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<ReelUploadData, "college_id">>({
    reel: null,
    type: "",
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith("video/")) {
      setFormData((prev) => ({ ...prev, reel: file }));
    } else {
      alert("Please select a video file");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reel || !formData.type) {
      alert("Please fill in all fields");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      await onUpload?.({ ...formData, college_id: collegeId }, (progress) =>
        setUploadProgress(progress)
      );
      setOpen(false);
      setFormData({ reel: null, type: "" });
      setUploadProgress(0);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({ reel: null, type: "" });
    setIsDragOver(false);
    setUploadProgress(0);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button
            className="w-full md:w-auto  px-4 h-10"
            style={{ backgroundColor: "#14b8a6", color: "white" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#0f766e")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#14b8a6")
            }
          >
            Upload Reel
            <Upload className="w-4 h-4 mr-2" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{ color: "#14b8a6" }}>
            Upload Your Reel
          </DialogTitle>
        </DialogHeader>

        {isUploading && (
          <span className="text-red-600 text-sm my-2 flex flex-row gap-2">
            <Info />
            We will continue uploading your video in background, you can close
            this dialog now and read some articles.
          </span>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragOver ? "bg-opacity-5" : "bg-gray-1",
              formData.reel && "bg-opacity-5",
              isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            )}
            style={{
              borderColor: isDragOver || formData.reel ? "#14b8a6" : "#e5e7eb",
              backgroundColor:
                isDragOver || formData.reel
                  ? "rgba(20, 184, 166, 0.05)"
                  : undefined,
            }}
            onDrop={isUploading ? undefined : handleDrop}
            onDragOver={isUploading ? undefined : handleDragOver}
            onDragLeave={isUploading ? undefined : handleDragLeave}
            onClick={
              isUploading ? undefined : () => fileInputRef.current?.click()
            }
          >
            <input
              aria-label="Upload Reel"
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />

            {formData.reel ? (
              <div className="space-y-2">
                <Video
                  className="w-12 h-12 mx-auto"
                  style={{ color: "#14b8a6" }}
                />
                <p className="font-sans text-sm text-foreground font-medium">
                  {formData.reel.name}
                </p>
                <p className="font-sans text-xs text-muted-foreground">
                  {isUploading ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-sans text-muted-foreground">
                          Uploading...
                        </span>
                        <span className="font-sans text-muted-foreground">
                          {Math.round(uploadProgress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300 ease-out"
                          style={{
                            width: `${uploadProgress}%`,
                            backgroundColor: "#14b8a6",
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    "Click to change video"
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="font-sans text-base text-muted-foreground">
                  {isUploading
                    ? "Upload in progress..."
                    : "Drag & Drop your video here or click to upload"}
                </p>
                <p className="font-sans text-sm text-muted-foreground">
                  Supports MP4, MOV, AVI formats
                </p>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="type"
                className="font-sans text-sm text-muted-foreground"
              >
                Reel Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
                disabled={isUploading}
              >
                <SelectTrigger
                  className="font-sans bg-input border-border"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <SelectValue placeholder="Select reel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campus">Campus</SelectItem>
                  <SelectItem value="labs">Labs</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="co-curriculum">Co-curriculum</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 font-sans border-border text-muted-foreground hover:bg-muted"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 font-sans"
              style={{ backgroundColor: "#14b8a6", color: "white" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#0f766e")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#14b8a6")
              }
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Reel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
