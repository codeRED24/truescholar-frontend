"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFormContext } from "@/components/form-provider";
import { FileUpload } from "@/components/file-upload";
import { User, Linkedin, Upload, Phone, Mail } from "lucide-react";
import { Controller } from "react-hook-form";
import { useRef } from "react";

export function ProfileVerificationStep() {
  const { formData, profileVerificationForm } = useFormContext();
  const {
    control,
    formState: { errors },
    watch,
  } = profileVerificationForm;
  const profilePictureInputRef = useRef<HTMLInputElement>(null);

  const profilePicture = watch("profilePicture");

  const handleProfilePictureClick = () => {
    profilePictureInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Profile Verification
      </h2>

      {/* Profile Section */}
      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-teal-300 flex items-center justify-center bg-white overflow-hidden">
            {profilePicture ? (
              <img
                src={URL.createObjectURL(profilePicture)}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User className="w-8 h-8 text-teal-300" />
            )}
          </div>
          <Controller
            name="profilePicture"
            control={control}
            render={({ field }) => (
              <>
                <input
                  ref={profilePictureInputRef}
                  type="file"
                  accept="image/*"
                  aria-label="Upload profile picture"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || undefined;
                    field.onChange(file);
                  }}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={handleProfilePictureClick}
                  className="bg-teal-500 hover:bg-teal-600 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {profilePicture ? "Change Picture" : "Upload Picture"}
                </Button>
              </>
            )}
          />
        </div>
        {errors.profilePicture && (
          <p className="text-sm text-red-500">
            {errors.profilePicture.message as string}
          </p>
        )}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span>{formData.name || "Name"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span>{formData.email || "Email"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span>{formData.contactNumber || "Contact"}</span>
          </div>
        </div>
      </div>

      {/* LinkedIn Profile */}
      <div className="space-y-2">
        <Label
          htmlFor="linkedin"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Linkedin className="w-4 h-4 text-blue-600" />
          Your LinkedIn Profile
        </Label>
        <Controller
          name="linkedinProfile"
          control={control}
          render={({ field }) => (
            <Input
              id="linkedin"
              {...field}
              placeholder="Enter LinkedIn Profile URL"
              className="border-gray-300"
            />
          )}
        />
        {errors.linkedinProfile && (
          <p className="text-sm text-red-500">
            {errors.linkedinProfile.message as string}
          </p>
        )}
      </div>

      {/* File Uploads */}
      <div className="space-y-6">
        <Controller
          name="studentId"
          control={control}
          render={({ field }) => (
            <div>
              <FileUpload
                label="Upload Student ID"
                file={field.value || null}
                onFileChange={(file) => field.onChange(file)}
                accept="image/*,.pdf"
              />
              {errors.studentId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.studentId.message as string}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="markSheet"
          control={control}
          render={({ field }) => (
            <div>
              <FileUpload
                label="Upload Mark Sheet"
                file={field.value || null}
                onFileChange={(file) => field.onChange(file)}
                accept="image/*,.pdf"
              />
              {errors.markSheet && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.markSheet.message as string}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="degreeCertificate"
          control={control}
          render={({ field }) => (
            <div>
              <FileUpload
                label="Upload Degree Certificate"
                file={field.value || null}
                onFileChange={(file) => field.onChange(file)}
                accept="image/*,.pdf"
              />
              {errors.degreeCertificate && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.degreeCertificate.message as string}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}
