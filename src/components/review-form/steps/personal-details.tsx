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
import { User, Mail, Users, Phone, Calendar, CreditCard } from "lucide-react";
import { Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useMemo } from "react";
import { useReviewForm } from "../form-provider";

export function PersonalDetailsStep() {
  const { personalForm } = useReviewForm();
  const {
    control,
    formState: { errors },
    watch,
  } = personalForm;

  const iAmValue = watch("iAm");

  // Date constraints (15-60 years old)
  const { minDate, maxDate } = useMemo(() => {
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    const now = new Date();
    const min = new Date(now);
    min.setFullYear(min.getFullYear() - 60);
    const max = new Date(now);
    max.setFullYear(max.getFullYear() - 15);
    return { minDate: fmt(min), maxDate: fmt(max) };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Personal Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <FormField
          name="name"
          control={control}
          label="Name"
          icon={<User className="w-4 h-4 text-teal-500" />}
          required
          error={errors.name?.message}
          render={({ field }) => (
            <Input {...field} placeholder="Enter your full name" />
          )}
        />

        {/* Email */}
        <FormField
          name="email"
          control={control}
          label="Email ID"
          icon={<Mail className="w-4 h-4 text-teal-500" />}
          required
          error={errors.email?.message}
          render={({ field }) => (
            <Input {...field} type="email" placeholder="Enter your email" />
          )}
        />

        {/* Gender */}
        <FormField
          name="gender"
          control={control}
          label="Gender"
          icon={<Users className="w-4 h-4 text-teal-500" />}
          required
          error={errors.gender?.message}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
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
              <div className="w-full p-px focus-within:ring-1 focus-within:ring-green-800 rounded-md">
                <PhoneInput
                  country="in"
                  value={field.value}
                  onChange={field.onChange}
                  inputStyle={{
                    border: "1px solid #D0D5DD",
                    borderRadius: "4px",
                    width: "100%",
                    height: "36px",
                    padding: "8px 8px 8px 40px",
                  }}
                  buttonStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #d0d5dd",
                    borderRight: "none",
                    borderRadius: "2px",
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
              {errors.contactNumber.message}
            </p>
          )}
        </div>

        {/* I am */}
        <FormField
          name="iAm"
          control={control}
          label="I am"
          icon={<Users className="w-4 h-4 text-teal-500" />}
          required
          error={errors.iAm?.message}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
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

        {/* College Roll Number (conditional) */}
        {iAmValue === "student" && (
          <FormField
            name="collegeRollNumber"
            control={control}
            label="College Roll Number"
            icon={<CreditCard className="w-4 h-4 text-teal-500" />}
            required
            error={errors.collegeRollNumber?.message}
            render={({ field }) => (
              <Input {...field} placeholder="Enter your college roll number" />
            )}
          />
        )}

        {/* Date of Birth */}
        <FormField
          name="dateOfBirth"
          control={control}
          label="Date of Birth"
          icon={<Calendar className="w-4 h-4 text-teal-500" />}
          required
          error={errors.dateOfBirth?.message}
          render={({ field }) => (
            <Input {...field} type="date" min={minDate} max={maxDate} />
          )}
        />

        {/* Referral Code */}
        <FormField
          name="referralCode"
          control={control}
          label="Referral Code"
          icon={<CreditCard className="w-4 h-4 text-teal-500" />}
          error={errors.referralCode?.message}
          render={({ field }) => (
            <Input {...field} placeholder="Enter referral code (optional)" />
          )}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Reusable FormField component to reduce boilerplate
// ============================================================================

interface FormFieldProps {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (props: { field: any }) => React.ReactElement;
}

function FormField({
  name,
  control,
  label,
  icon,
  required,
  error,
  render,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {label} {required && <span className="text-teal-600">*</span>}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => render({ field })}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
