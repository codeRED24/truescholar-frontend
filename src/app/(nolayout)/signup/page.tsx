"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSignupStore } from "@/stores/signupStore";
import { createUser, CreateUserRequest } from "@/api/users/createUser";
import { User, Mail, Users, Phone, CreditCard, Calendar } from "lucide-react";
import { useMemo } from "react";
import { countries } from "countries-list";
import { personalDetailsSchema } from "@/lib/validation-schemas";

// Form validation schema using personalDetailsSchema from validation-schemas.ts
const signupSchema = personalDetailsSchema
  .omit({ collegeRollNumber: true })
  .extend({
    collegeRollNumber: z.string().optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine(
    (data) => {
      // College roll number is required only for current students
      if (data.iAm === "student") {
        return data.collegeRollNumber && data.collegeRollNumber.length > 0;
      }
      return true;
    },
    {
      message: "College roll number is required for current students",
      path: ["collegeRollNumber"],
    }
  );

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { signupData, setSignupData, setLoading } = useSignupStore();

  console.log("SignupPage mounted/updated, signupData:", signupData);

  // Get initial form values from stored data or defaults
  const getInitialValues = (): SignupFormData => {
    if (signupData) {
      return {
        name: signupData.name || "",
        email: signupData.email || "",
        gender: signupData.gender || "",
        contactNumber: signupData.contactNumber || "",
        iAm: signupData.iAm || "",
        collegeRollNumber: signupData.collegeRollNumber || "",
        dateOfBirth: signupData.dateOfBirth || "",
        agreeToTerms: true,
        upiId: "",
        isEmailVerified: false,
        isPhoneVerified: false,
      };
    }
    return {
      name: "",
      email: "",
      gender: "",
      contactNumber: "",
      iAm: "",
      collegeRollNumber: "",
      dateOfBirth: "",
      agreeToTerms: false,
      upiId: "",
      isEmailVerified: false,
      isPhoneVerified: false,
    };
  };

  console.log("Initial values from getInitialValues:", getInitialValues());

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: getInitialValues(),
  });

  // Debug: Watch form values
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === "gender" || name === "iAm") {
        console.log(`Form field ${name} changed:`, value[name], "Type:", type);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Force re-render when signupData changes
  const [forceUpdate, setForceUpdate] = useState(0);

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

  // Update form when signupData changes (e.g., when navigating back)
  useEffect(() => {
    console.log("SignupData changed:", signupData);
    if (signupData) {
      // Small delay to ensure form is ready
      setTimeout(() => {
        reset({
          name: signupData.name || "",
          email: signupData.email || "",
          gender: signupData.gender || "",
          contactNumber: signupData.contactNumber || "",
          iAm: signupData.iAm || "",
          collegeRollNumber: signupData.collegeRollNumber || "",
          dateOfBirth: signupData.dateOfBirth || "",
          agreeToTerms: true,
          upiId: "",
          isEmailVerified: false,
          isPhoneVerified: false,
        });
        console.log("Form reset with data:", {
          gender: signupData.gender,
          iAm: signupData.iAm,
        });
        // Force re-render to ensure Select components update
        setForceUpdate((prev) => prev + 1);
      }, 100);
    }
  }, [signupData, reset]);

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    setLoading(true);

    try {
      // Create user using the same API as review form
      const userPayload: CreateUserRequest = {
        name: data.name,
        email: data.email,
        gender: data.gender,
        contact_number: data.contactNumber,
        iAm: data.iAm,
        college_roll_number: data.collegeRollNumber,
        dob: data.dateOfBirth,
        user_type: "student",
      };

      console.log("Creating user with payload:", userPayload);
      const userResponse = await createUser(userPayload);
      console.log("User response:", userResponse);

      // Store signup data in Zustand store
      setSignupData({
        name: data.name,
        email: data.email,
        gender: data.gender,
        contactNumber: data.contactNumber,
        iAm: data.iAm,
        collegeRollNumber: data.collegeRollNumber,
        dateOfBirth: data.dateOfBirth,
      });

      console.log("Storing signup data:", {
        name: data.name,
        email: data.email,
        gender: data.gender,
        contactNumber: data.contactNumber,
        iAm: data.iAm,
        collegeRollNumber: data.collegeRollNumber,
        dateOfBirth: data.dateOfBirth,
      });

      // Redirect to OTP verification page
      router.push("/otp");
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Split Layout */}
      <div className="flex flex-col lg:flex-row overflow-hidden shadow-xl min-h-screen">
        {/* Left Side - Image and Content */}
        <div className="w-full hidden lg:w-8/12 p-6 md:p-8 lg:p-12 lg:flex flex-col items-center justify-center relative">
          <div className="inset-0 absolute bg-gradient-to-b from-[#142D55] to-[#4777C4]"></div>
          {/* Logo */}
          <div className="absolute top-10 left-10">
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col text-right">
                <span className="text-orange-400 text-xl font-bold">READY</span>
                <span className="text-blue-300 text-xl font-bold">SET</span>
              </div>
              <span className="text-white text-8xl font-bold">SIGN UP</span>
            </div>
          </div>
          {/* 3D Characters */}
          {/* <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 mb-8 flex justify-center">
            <img
              src="https://i.imgur.com/6XkWvZJ.png"
              alt="Students"
              className="w-full h-full object-contain"
            />
          </div> */}
          {/* Daily Dash Feature */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 w-full max-w-md border border-white/20 absolute bottom-8 left-8">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="https://i.imgur.com/rFfRtQV.png"
                alt="Gift"
                className="w-10 h-10 md:w-12 md:h-12"
              />
              <h3 className="text-white font-bold text-base md:text-lg">
                Introducing Our Daily Dash Feature!
              </h3>
            </div>
            <div className="space-y-3 text-white/90 text-xs md:text-sm">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mt-1 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.12a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.12a1 1 0 00-1.175 0l-3.976 2.12c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.12c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <p>
                  <strong>Maintain Your Daily Dash:</strong> Engage every day
                  and make your Daily Dash – it's like a daily mission for
                  awesome rewards!
                </p>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mt-1 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.12a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.12a1 1 0 00-1.175 0l-3.976 2.12c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.12c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <p>
                  <strong>Level Up:</strong> Keep the Daily Dash alive to level
                  up and unlock cool prizes. Reach milestones like 100 days, 200
                  days, and beyond for extra bonuses!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-4/12 bg-gradient-to-br from-white to-gray-100 p-6 md:p-8 flex flex-col justify-center">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              <span className="text-blue-600">GET</span>{" "}
              <span className="text-orange-500">STARTED</span>
            </h2>
            <p className="text-gray-600 text-xs md:text-sm">
              Begin your college journey now! Sign up to explore options
            </p>
          </div>

          <form
            key={signupData ? "with-data" : "without-data"}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 md:space-y-6"
          >
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
                      key={`gender-${forceUpdate}`}
                      value={field.value}
                      onValueChange={field.onChange}
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
                        onChange={field.onChange}
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

              {/* I am */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Users className="w-4 h-4 text-teal-500" />I am{" "}
                  <span className="text-teal-600">*</span>
                </Label>
                <Controller
                  name="iAm"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={`iAm-${forceUpdate}`}
                      value={field.value}
                      onValueChange={field.onChange}
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
                        <SelectItem value="teaching-staff">
                          Teaching Staff
                        </SelectItem>
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

              {/* College Roll Number - Conditional */}
              {watch("iAm") === "student" && (
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
                    />
                  )}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-600">
                    {errors.dateOfBirth.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-2">
              <Controller
                name="agreeToTerms"
                control={control}
                render={({ field }) => (
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label
                      htmlFor="agreeToTerms"
                      className="text-xs md:text-sm font-medium text-gray-700"
                    >
                      Ready to roll? Your sign-up means you're on board with our{" "}
                      <a
                        href="/terms"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Terms
                      </a>{" "}
                      &{" "}
                      <a
                        href="/privacy"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                )}
              />
              {errors.agreeToTerms && (
                <p className="text-xs text-red-600">
                  {errors.agreeToTerms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 md:py-3 px-4 rounded-lg transition-colors duration-200 text-sm md:text-base"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                "Continue"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 md:mt-8 text-center text-xs md:text-sm text-gray-600">
            <p>
              Been here before, eh? Skip the formalities and{" "}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Log in
              </a>{" "}
              like a pro!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
