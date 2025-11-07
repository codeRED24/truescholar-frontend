import {
  User,
  Mail,
  Users,
  Phone,
  CreditCard,
  Calendar,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
} from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { SuggestionInput } from "../ui/suggestion-input";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { sendEmailOtp } from "@/api/auth/auth";
import { OtpForm } from "./OtpForm";
import { getCurrentLocation } from "../utils/utils";
import { useCallback, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { signupSchema } from "@/app/schemas/signup-schema";
import { createUser } from "@/api/users/createUser";

interface SignupFormProps {
  onStepChange?: (step: "signup" | "verify") => void;
  returnUrl?: string;
}

export function SignupForm({ onStepChange, returnUrl }: SignupFormProps = {}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Verification state
  const [verificationStep, setVerificationStep] = useState<"signup" | "verify">(
    "signup"
  );
  const [signupData, setSignupData] = useState<any | null>(null);

  type SignupFormData = z.infer<typeof signupSchema>;

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

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

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const fetchCollegeSuggestions = useCallback(
    async (query: string): Promise<string[]> => {
      if (!query || query.length < 2) {
        return [];
      }

      try {
        const url = `${
          process.env.NEXT_PUBLIC_API_URL
        }/college-search?q=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const colleges = data.data.colleges || [];

        return colleges.map(
          (college: any) => college.college_name || college.name
        );
      } catch (error) {
        console.error("Error fetching college suggestions:", error);
        return [];
      }
    },
    []
  );

  const handleCollegeSelect = (collegeName: string) => {};

  // Form submission handler
  const onSubmit = async (data: SignupFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setApiError(null);
    try {
      // Attempt to get the user's current location with a short timeout.
      // If location is unavailable or times out, we keep it null.
      const getLocationWithTimeout = async (ms = 3000) => {
        try {
          const locationPromise = getCurrentLocation();
          const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), ms)
          );
          const result: any = await Promise.race([
            locationPromise as Promise<any>,
            timeoutPromise,
          ]);
          if (
            !result ||
            typeof result.latitude !== "number" ||
            typeof result.longitude !== "number"
          ) {
            return null;
          }
          return `${result.latitude}, ${result.longitude}`;
        } catch (e) {
          return null;
        }
      };

      const userLocation = await getLocationWithTimeout(3000);

      const userData = {
        name: data.name,
        email: data.email,
        gender: data.gender,
        contact_number: data.contactNumber,
        user_type: data.iAm,
        college: data.college,
        college_roll_number: data.collegeRollNumber,
        dob: data.dateOfBirth,
        user_location: userLocation || undefined,
        referred_by: data.referralCode,
        password: data.password,
      };

      // Store signup data and move to verification step
      setSignupData(userData);

      await createUser(userData);

      // Send email OTP
      await sendEmailOtp({ identifier: data.email.toLowerCase() });
      setIsSubmitting(false);
      setVerificationStep("verify");
      onStepChange?.("verify");
    } catch (error: any) {
      console.error("Signup failed:", error);

      // Extract error message from API response
      if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else if (error.message) {
        setApiError(error.message);
      } else {
        setApiError("Something went wrong!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSuccess = () => {
    // You could redirect to a success page or dashboard here
    // For now, just reset the form
    setVerificationStep("signup");
    onStepChange?.("signup");
    setSignupData(null);
    reset();
  };

  const handleBackToSignup = () => {
    setVerificationStep("signup");
    onStepChange?.("signup");
    setSignupData(null);
  };

  // Show OTP form if in verification step
  if (verificationStep === "verify" && signupData) {
    return (
      <OtpForm
        signupData={signupData}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={handleBackToSignup}
        returnUrl={returnUrl}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 md:space-y-6 h-full"
    >
      {/* API Error Alert */}
      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 mt-1">{apiError}</p>
          </div>
        </div>
      )}

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
              <Select value={field.value} onValueChange={field.onChange}>
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

        {/* Password */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Lock className="w-4 h-4 text-teal-500" />
            Password <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Input
                  {...field}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`border-gray-300 pr-10 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {!showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            )}
          />
          {errors.password && (
            <p className="text-sm text-red-600">
              {errors.password.message as string}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Lock className="w-4 h-4 text-teal-500" />
            Confirm Password <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Input
                  {...field}
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className={`border-gray-300 pr-10 ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {!showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            )}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">
              {errors.confirmPassword.message as string}
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
              <Select value={field.value} onValueChange={field.onChange}>
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

        {/* College */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4 text-teal-500" />
            College
          </Label>
          <Controller
            name="college"
            control={control}
            render={({ field }) => (
              <SuggestionInput
                {...field}
                placeholder="Search and select your college (optional)"
                fetchSuggestions={fetchCollegeSuggestions}
                onSelect={handleCollegeSelect}
                className={`border-gray-300 ${
                  errors.college ? "border-red-500" : ""
                }`}
              />
            )}
          />
          {errors.college && (
            <p className="text-sm text-red-600">
              {errors.college.message as string}
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
              College Roll Number
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
              />
            )}
          />
          {errors.referralCode && (
            <p className="text-sm text-red-600">
              {errors.referralCode.message as string}
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
          <p className="text-xs text-red-600">{errors.agreeToTerms.message}</p>
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
  );
}
