"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "@/components/form-provider";
import { OtpVerification } from "@/components/otp-verification";
import {
  User,
  Mail,
  Users,
  Phone,
  Globe,
  GraduationCap,
  MapPin,
  BookOpen,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";

export function PersonalDetailsStep() {
  const { formData, updateFormData, personalDetailsForm } = useFormContext();
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = personalDetailsForm;

  const [otpStates, setOtpStates] = useState({
    emailSent: false,
    phoneSent: false,
    emailLoading: false,
    phoneLoading: false,
    emailError: "",
    phoneError: "",
  });

  const watchedEmail = watch("email");
  const watchedPhone = watch("contactNumber");
  const isEmailVerified = watch("isEmailVerified") || false;
  const isPhoneVerified = watch("isPhoneVerified") || false;

  const handleSendEmailOtp = async () => {
    if (!watchedEmail) return;

    setOtpStates((prev) => ({ ...prev, emailLoading: true, emailError: "" }));

    // Simulate API call
    setTimeout(() => {
      setOtpStates((prev) => ({
        ...prev,
        emailSent: true,
        emailLoading: false,
      }));
    }, 1000);
  };

  const handleSendPhoneOtp = async () => {
    if (!watchedPhone) return;

    setOtpStates((prev) => ({ ...prev, phoneLoading: true, phoneError: "" }));

    // Simulate API call
    setTimeout(() => {
      setOtpStates((prev) => ({
        ...prev,
        phoneSent: true,
        phoneLoading: false,
      }));
    }, 1000);
  };

  const handleVerifyEmailOtp = async (otp: string) => {
    setOtpStates((prev) => ({ ...prev, emailLoading: true, emailError: "" }));

    // Simulate API call
    setTimeout(() => {
      if (otp === "123456") {
        // Mock verification
        setValue("isEmailVerified", true);
        updateFormData({ isEmailVerified: true });
        setOtpStates((prev) => ({ ...prev, emailLoading: false }));
      } else {
        setOtpStates((prev) => ({
          ...prev,
          emailLoading: false,
          emailError: "Invalid OTP. Please try again.",
        }));
      }
    }, 1000);
  };

  const handleVerifyPhoneOtp = async (otp: string) => {
    setOtpStates((prev) => ({ ...prev, phoneLoading: true, phoneError: "" }));

    // Simulate API call
    setTimeout(() => {
      if (otp === "123456") {
        // Mock verification
        setValue("isPhoneVerified", true);
        updateFormData({ isPhoneVerified: true });
        setOtpStates((prev) => ({ ...prev, phoneLoading: false }));
      } else {
        setOtpStates((prev) => ({
          ...prev,
          phoneLoading: false,
          phoneError: "Invalid OTP. Please try again.",
        }));
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Personal Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <User className="w-4 h-4 text-teal-500" />
            Name <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="name"
                placeholder="Enter your full name"
                className={`border-gray-300 ${
                  errors.name ? "border-red-500" : ""
                }`}
                onChange={(e) => {
                  field.onChange(e);
                  updateFormData({ name: e.target.value });
                }}
              />
            )}
          />
          {errors.name && (
            <p className="text-sm text-red-600">
              {errors.name.message as string}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Mail className="w-4 h-4 text-teal-500" />
            Email ID <span className="text-teal-600">*</span>
          </Label>
          {!otpStates.emailSent ? (
            <div className="flex gap-2">
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className={`flex-1 border-gray-300 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    onChange={(e) => {
                      field.onChange(e);
                      updateFormData({ email: e.target.value });
                      // Reset verification when email changes
                      if (isEmailVerified) {
                        setValue("isEmailVerified", false);
                        updateFormData({ isEmailVerified: false });
                      }
                    }}
                  />
                )}
              />
              <Button
                type="button"
                onClick={handleSendEmailOtp}
                disabled={
                  !watchedEmail || !!errors.email || otpStates.emailLoading
                }
                className="bg-teal-600 hover:bg-teal-700 whitespace-nowrap"
              >
                {otpStates.emailLoading ? "Sending..." : "Send OTP"}
              </Button>
            </div>
          ) : (
            <OtpVerification
              type="email"
              value={watchedEmail}
              onVerify={handleVerifyEmailOtp}
              onResend={handleSendEmailOtp}
              isVerified={isEmailVerified}
              isLoading={otpStates.emailLoading}
              error={otpStates.emailError}
            />
          )}
          {errors.email && (
            <p className="text-sm text-red-600">
              {errors.email.message as string}
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4 text-teal-500" />
            Gender <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  updateFormData({ gender: value });
                }}
              >
                <SelectTrigger
                  className={`border-gray-300 ${
                    errors.gender ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender && (
            <p className="text-sm text-red-600">
              {errors.gender.message as string}
            </p>
          )}
        </div>

        {/* Contact Number */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Phone className="w-4 h-4 text-teal-500" />
            Contact Number <span className="text-teal-600">*</span>
          </Label>
          {!otpStates.phoneSent ? (
            <>
              <div className="flex gap-2">
                <Controller
                  name="countryCode"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        updateFormData({ countryCode: value });
                      }}
                    >
                      <SelectTrigger className="w-32 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN (+91)">IN (+91)</SelectItem>
                        <SelectItem value="US (+1)">US (+1)</SelectItem>
                        <SelectItem value="UK (+44)">UK (+44)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <Controller
                  name="contactNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter contact number"
                      className={`flex-1 border-gray-300 ${
                        errors.contactNumber ? "border-red-500" : ""
                      }`}
                      onChange={(e) => {
                        field.onChange(e);
                        updateFormData({ contactNumber: e.target.value });
                        // Reset verification when phone changes
                        if (isPhoneVerified) {
                          setValue("isPhoneVerified", false);
                          updateFormData({ isPhoneVerified: false });
                        }
                      }}
                    />
                  )}
                />
                <Button
                  type="button"
                  onClick={handleSendPhoneOtp}
                  disabled={
                    !watchedPhone ||
                    !!errors.contactNumber ||
                    otpStates.phoneLoading
                  }
                  className="bg-teal-600 hover:bg-teal-700 whitespace-nowrap"
                >
                  {otpStates.phoneLoading ? "Sending..." : "Send OTP"}
                </Button>
              </div>
            </>
          ) : (
            <OtpVerification
              type="phone"
              value={`${watch("countryCode")} ${watchedPhone}`}
              onVerify={handleVerifyPhoneOtp}
              onResend={handleSendPhoneOtp}
              isVerified={isPhoneVerified}
              isLoading={otpStates.phoneLoading}
              error={otpStates.phoneError}
            />
          )}
          {errors.contactNumber && (
            <p className="text-sm text-red-600">
              {errors.contactNumber.message as string}
            </p>
          )}
        </div>

        {/* Country of Origin */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Globe className="w-4 h-4 text-teal-500" />
            Country Of Origin <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="countryOfOrigin"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  updateFormData({ countryOfOrigin: value });
                }}
              >
                <SelectTrigger
                  className={`border-gray-300 ${
                    errors.countryOfOrigin ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="usa">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.countryOfOrigin && (
            <p className="text-sm text-red-600">
              {errors.countryOfOrigin.message as string}
            </p>
          )}
        </div>

        {/* College Name */}
        <div className="space-y-2">
          <Label
            htmlFor="collegeName"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <GraduationCap className="w-4 h-4 text-teal-500" />
            College Name <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="collegeName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="collegeName"
                placeholder="Enter your college name"
                className={`border-gray-300 ${
                  errors.collegeName ? "border-red-500" : ""
                }`}
                onChange={(e) => {
                  field.onChange(e);
                  updateFormData({ collegeName: e.target.value });
                }}
              />
            )}
          />
          {errors.collegeName && (
            <p className="text-sm text-red-600">
              {errors.collegeName.message as string}
            </p>
          )}
        </div>

        {/* College Location */}
        <div className="space-y-2">
          <Label
            htmlFor="collegeLocation"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <MapPin className="w-4 h-4 text-teal-500" />
            College Location <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="collegeLocation"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="collegeLocation"
                placeholder="Enter college location"
                className={`border-gray-300 ${
                  errors.collegeLocation ? "border-red-500" : ""
                }`}
                onChange={(e) => {
                  field.onChange(e);
                  updateFormData({ collegeLocation: e.target.value });
                }}
              />
            )}
          />
          {errors.collegeLocation && (
            <p className="text-sm text-red-600">
              {errors.collegeLocation.message as string}
            </p>
          )}
        </div>

        {/* Course Name */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="w-4 h-4 text-teal-500" />
            Course Name <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="courseName"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  updateFormData({ courseName: value });
                }}
              >
                <SelectTrigger
                  className={`border-gray-300 ${
                    errors.courseName ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="btech-cse">
                    B.Tech. in Computer Science and Engineering
                  </SelectItem>
                  <SelectItem value="btech-ece">
                    B.Tech. in Electronics and Communication
                  </SelectItem>
                  <SelectItem value="btech-me">
                    B.Tech. in Mechanical Engineering
                  </SelectItem>
                  <SelectItem value="btech-ce">
                    B.Tech. in Civil Engineering
                  </SelectItem>
                  <SelectItem value="mtech">M.Tech</SelectItem>
                  <SelectItem value="mba">MBA</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.courseName && (
            <p className="text-sm text-red-600">
              {errors.courseName.message as string}
            </p>
          )}
        </div>

        {/* Graduation Year */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4 text-teal-500" />
            Graduation Year <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="graduationYear"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  updateFormData({ graduationYear: value });
                }}
              >
                <SelectTrigger
                  className={`border-gray-300 ${
                    errors.graduationYear ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => 2020 + i).map(
                    (year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.graduationYear && (
            <p className="text-sm text-red-600">
              {errors.graduationYear.message as string}
            </p>
          )}
        </div>

        {/* UPI ID */}
        <div className="space-y-2 md:col-span-2">
          <Label
            htmlFor="upiId"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <CreditCard className="w-4 h-4 text-teal-500" />
            Enter UPI ID For Cash Rewards{" "}
            <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="upiId"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="upiId"
                placeholder="Enter your UPI ID (e.g., username@paytm)"
                className={`border-gray-300 ${
                  errors.upiId ? "border-red-500" : ""
                }`}
                onChange={(e) => {
                  field.onChange(e);
                  updateFormData({ upiId: e.target.value });
                }}
              />
            )}
          />
          {errors.upiId && (
            <p className="text-sm text-red-600">
              {errors.upiId.message as string}
            </p>
          )}
          <p className="text-sm text-teal-700">
            Sharing Your UPI ID with TrueScholar is 100% safe, secure &
            confidential. Your UPI will be used solely to share rewards.{""}
            <a
              href="/privacy-policy"
              className="underline text-teal-600 hover:text-teal-800"
            >
              Concerned About Privacy?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
