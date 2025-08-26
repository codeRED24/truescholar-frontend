"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFormContext } from "@/components/form-provider";
import { Controller } from "react-hook-form";
import { IndianRupee } from "lucide-react";

export function FinancialInformationStep() {
  const { studentReviewForm } = useFormContext();
  const {
    control,
    formState: { errors },
    watch,
  } = studentReviewForm;

  const [showScholarshipFields, setShowScholarshipFields] = useState(false);
  const scholarshipAvailed = watch("scholarshipAvailed");

  // Update conditional fields visibility
  React.useEffect(() => {
    setShowScholarshipFields(scholarshipAvailed === true);
  }, [scholarshipAvailed]);

  return (
    <div className="">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Financial Information
      </h2>

      <div className="space-y-6">
        {/* Financial Information Section */}
        <div className="pt-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            College Fees & Expenses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Annual Tuition Fees */}
            <div className="space-y-2">
              <Label
                htmlFor="annualTuitionFees"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <IndianRupee className="w-4 h-4 text-teal-500" />
                Annual Tuition Fees <span className="text-teal-600">*</span>
              </Label>
              <Controller
                name="annualTuitionFees"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <Input
                      {...field}
                      value={value === 0 ? "" : value?.toString() || ""}
                      onChange={(e) => {
                        const numValue =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        onChange(isNaN(numValue) ? 0 : numValue);
                      }}
                      id="annualTuitionFees"
                      type="number"
                      placeholder="Enter annual tuition fees"
                      className={`border-gray-300 pl-8 ${
                        errors.annualTuitionFees ? "border-red-500" : ""
                      }`}
                      min="0"
                      step="1000"
                    />
                  </div>
                )}
              />
              {errors.annualTuitionFees && (
                <p className="text-sm text-red-600">
                  {errors.annualTuitionFees.message as string}
                </p>
              )}
            </div>

            {/* Hostel Fees */}
            <div className="space-y-2">
              <Label
                htmlFor="hostelFees"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <IndianRupee className="w-4 h-4 text-teal-500" />
                Hostel Fees (if applicable)
              </Label>
              <Controller
                name="hostelFees"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <Input
                      {...field}
                      value={value === 0 ? "" : value?.toString() || ""}
                      onChange={(e) => {
                        const numValue =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        onChange(isNaN(numValue) ? 0 : numValue);
                      }}
                      id="hostelFees"
                      type="number"
                      placeholder="Enter hostel fees (if applicable)"
                      className="border-gray-300 pl-8"
                      min="0"
                      step="1000"
                    />
                  </div>
                )}
              />
              {errors.hostelFees && (
                <p className="text-sm text-red-600">
                  {errors.hostelFees.message as string}
                </p>
              )}
            </div>

            {/* Any Other College Charges */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="otherCharges"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <IndianRupee className="w-4 h-4 text-teal-500" />
                Any Other College Charges
              </Label>
              <Controller
                name="otherCharges"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <Input
                      {...field}
                      value={value === 0 ? "" : value?.toString() || ""}
                      onChange={(e) => {
                        const numValue =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        onChange(isNaN(numValue) ? 0 : numValue);
                      }}
                      id="otherCharges"
                      type="number"
                      placeholder="Enter any other college charges (exam fees, library fees, etc.)"
                      className="border-gray-300 pl-8"
                      min="0"
                      step="100"
                    />
                  </div>
                )}
              />
              {errors.otherCharges && (
                <p className="text-sm text-red-600">
                  {errors.otherCharges.message as string}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Scholarship Information Section */}
        <div className="pt-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Scholarship & Financial Aid
          </h3>
          <div className="space-y-6">
            {/* Scholarship/Fee Waiver Availed */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                Scholarship / Fee Waiver Availed?
              </Label>
              <Controller
                name="scholarshipAvailed"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...field}
                        value="false"
                        checked={field.value === false}
                        onChange={() => field.onChange(false)}
                        className="mr-2"
                      />
                      No
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...field}
                        value="true"
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                        className="mr-2"
                      />
                      Yes
                    </label>
                  </div>
                )}
              />
            </div>

            {/* Conditional Scholarship Fields */}
            {showScholarshipFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                {/* Scholarship Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="scholarshipName"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    Scholarship Name <span className="text-teal-600">*</span>
                  </Label>
                  <Controller
                    name="scholarshipName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="scholarshipName"
                        placeholder="Enter scholarship name"
                        className={`border-gray-300 ${
                          errors.scholarshipName ? "border-red-500" : ""
                        }`}
                      />
                    )}
                  />
                  {errors.scholarshipName && (
                    <p className="text-sm text-red-600">
                      {errors.scholarshipName.message as string}
                    </p>
                  )}
                </div>

                {/* Amount Covered by Scholarship */}
                <div className="space-y-2">
                  <Label
                    htmlFor="scholarshipAmount"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    Amount Covered by Scholarship{" "}
                    <span className="text-teal-600">*</span>
                  </Label>
                  <Controller
                    name="scholarshipAmount"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <Input
                          {...field}
                          value={value === 0 ? "" : value?.toString() || ""}
                          onChange={(e) => {
                            const numValue =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            onChange(isNaN(numValue) ? 0 : numValue);
                          }}
                          id="scholarshipAmount"
                          type="number"
                          placeholder="Enter scholarship amount"
                          className={`border-gray-300 pl-8 ${
                            errors.scholarshipAmount ? "border-red-500" : ""
                          }`}
                          min="0"
                          step="1000"
                        />
                      </div>
                    )}
                  />
                  {errors.scholarshipAmount && (
                    <p className="text-sm text-red-600">
                      {errors.scholarshipAmount.message as string}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
