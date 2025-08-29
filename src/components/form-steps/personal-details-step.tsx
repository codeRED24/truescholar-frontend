"use client";

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
import {
  User,
  Mail,
  Users,
  Phone,
  Globe,
  CreditCard,
  Calendar,
} from "lucide-react";
import { Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useEffect, useMemo } from "react";
import { countries } from "countries-list";

export function PersonalDetailsStep() {
  const { formData, updateFormData, personalDetailsForm } = useFormContext();
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = personalDetailsForm;

  // Auto-fill referral code from URL parameter if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get("ref");
    if (referralCode && !formData.referralCode) {
      setValue("referralCode", referralCode);
      updateFormData({ referralCode });
    }
  }, [setValue, updateFormData, formData.referralCode]);

  const isPhoneVerified = watch("isPhoneVerified") || false;
  const iAmValue = watch("iAm");

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Allow only users aged between 15 and 60 years
  const minDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 60);
    return formatDate(d);
  }, []);

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 15);
    return formatDate(d);
  }, []);

  // Sorted countries with India first
  const sortedCountries = useMemo(() => {
    const entries = Object.keys(countries).map((code) => ({
      code,
      name: countries[code as keyof typeof countries].name,
    }));

    entries.sort((a, b) => a.name.localeCompare(b.name));

    // Move India to the top if present
    const indiaIndex = entries.findIndex(
      (e) => e.name.toLowerCase() === "india" || e.code.toLowerCase() === "in"
    );
    if (indiaIndex > 0) {
      const [india] = entries.splice(indiaIndex, 1);
      entries.unshift(india);
    }

    return entries;
  }, []);

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
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="email"
                type="email"
                placeholder="Enter your official email address"
                className={`border-gray-300 ${
                  errors.email ? "border-red-500" : ""
                }`}
                onChange={(e) => {
                  field.onChange(e);
                  updateFormData({ email: e.target.value });
                }}
              />
            )}
          />
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
                  <SelectItem value="n-a">Prefer Not To Say</SelectItem>
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
          <Controller
            name="contactNumber"
            control={control}
            render={({ field }) => (
              <div className="w-full p-[1px] focus-within:ring-1 focus-within:ring-green-800 rounded-md z-10">
                <PhoneInput
                  country="in"
                  value={field.value}
                  onChange={(phone) => {
                    field.onChange(phone);
                    updateFormData({ contactNumber: phone });
                    // Reset verification when phone changes
                    if (isPhoneVerified) {
                      setValue("isPhoneVerified", false);
                      updateFormData({ isPhoneVerified: false });
                    }
                  }}
                  inputStyle={{
                    border: "1px solid #D0D5DD",
                    borderRadius: "4px !important",
                    width: "100%",
                    height: "36px",
                    padding: "8px 8px 8px 40px",
                  }}
                  buttonStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #d0d5dd",
                    borderRight: "none",
                    borderRadius: "2px !important",
                  }}
                  placeholder="Enter contact number"
                  enableSearch
                  containerStyle={{ width: "100%" }}
                  disableSearchIcon
                  searchPlaceholder="Search countries..."
                  specialLabel=""
                />
              </div>
            )}
          />
          {errors.contactNumber && (
            <p className="text-sm text-red-600">
              {errors.contactNumber.message as string}
            </p>
          )}
        </div>

        {/* Country of Origin - Commented out */}
        {/*
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
                  {sortedCountries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
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
        */}

        {/* I am */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4 text-teal-500" />I am{" "}
          </Label>
          <Controller
            name="iAm"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  updateFormData({ iAm: value });
                  if (value !== "student") {
                    setValue("collegeRollNumber", "");
                    updateFormData({ collegeRollNumber: "" });
                  }
                }}
              >
                <SelectTrigger
                  className={`border-gray-300 ${
                    errors.iAm ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                  <SelectItem value="teaching-staff">Teaching Staff</SelectItem>
                  <SelectItem value="non-teaching-staff">
                    Non-teaching Staff
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.iAm && (
            <p className="text-sm text-red-600">
              {errors.iAm.message as string}
            </p>
          )}
        </div>

        {/* College Roll Number */}
        {iAmValue === "student" && (
          <div className="space-y-2">
            <Label
              htmlFor="collegeRollNumber"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <CreditCard className="w-4 h-4 text-teal-500" />
              College Roll Number <span className="text-teal-600">*</span>
            </Label>
            <Controller
              name="collegeRollNumber"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="collegeRollNumber"
                  placeholder="Enter your college roll number"
                  className={`border-gray-300 ${
                    errors.collegeRollNumber ? "border-red-500" : ""
                  }`}
                  onChange={(e) => {
                    field.onChange(e);
                    updateFormData({ collegeRollNumber: e.target.value });
                  }}
                />
              )}
            />
            {errors.collegeRollNumber && (
              <p className="text-sm text-red-600">
                {errors.collegeRollNumber.message as string}
              </p>
            )}
          </div>
        )}

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label
            htmlFor="dateOfBirth"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Calendar className="w-4 h-4 text-teal-500" />
            Date of Birth <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="dateOfBirth"
                type="date"
                min={minDate}
                max={maxDate}
                placeholder="Select your date of birth"
                className={`border-gray-300  ${
                  errors.dateOfBirth ? "border-red-500" : ""
                }`}
                onChange={(e) => {
                  field.onChange(e);
                  updateFormData({ dateOfBirth: e.target.value });
                }}
              />
            )}
          />
          {errors.dateOfBirth && (
            <p className="text-sm text-red-600">
              {errors.dateOfBirth.message as string}
            </p>
          )}
        </div>

        {/* Referral Code */}
        <div className="space-y-2">
          <Label
            htmlFor="referralCode"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <CreditCard className="w-4 h-4 text-teal-500" />
            Referral Code
          </Label>
          <Controller
            name="referralCode"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="referralCode"
                placeholder="Enter referral code (optional)"
                className={`border-gray-300 ${
                  errors.referralCode ? "border-red-500" : ""
                }`}
                onChange={(e) => {
                  field.onChange(e);
                  updateFormData({ referralCode: e.target.value });
                }}
              />
            )}
          />
          {errors.referralCode && (
            <p className="text-sm text-red-600">
              {errors.referralCode.message as string}
            </p>
          )}
        </div>

        {/* UPI ID */}
        {/* <div className="space-y-2">
          <Label
            htmlFor="upiId"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <CreditCard className="w-4 h-4 text-teal-500" />
            Enter UPI ID For Cash Rewards{" "}
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
        </div> */}

        {/* UPI Description */}
        {/* <div className="space-y-2 md:col-span-2">
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
        </div> */}
      </div>
    </div>
  );
}
