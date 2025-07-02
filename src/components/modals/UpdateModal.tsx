"use client";
import React, { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UpdateForm from "../forms/UpdateForm";

interface UpdateModalProps {
  triggerText?: React.ReactNode | string;
  btnColor?: string;
  btnTextColor?: string; 
  btnWidth?: string;
  btnMinWidth?: string;
  btnPadding?: string;
  btnVariant?: "default" | "link" | "ghost" | "destructive" | "outline" | "secondary";
}

export const UpdateModal = memo(({
  triggerText = "Subscribe",
  btnColor,
  btnTextColor,
  btnVariant = "default",
  btnWidth,
  btnMinWidth,
  btnPadding,
}: UpdateModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={btnVariant}
          style={{
            backgroundColor: btnColor,
            color: btnTextColor,
            width: btnWidth,
            minWidth: btnMinWidth,
            padding: btnPadding,
          }}
          className="w-1/2 border border-transparent transition-colors hover:border-white md:w-fit"
        >
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-sm rounded-lg bg-white p-6 antialiased sm:max-w-md"
        aria-label="Newsletter Subscription Modal"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Subscribe to Our Newsletter
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Stay updated with the latest news and offers
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <UpdateForm />
        </div>
      </DialogContent>
    </Dialog>
  );
});

// Add display name for better debugging
UpdateModal.displayName = "UpdateModal";

export default UpdateModal;