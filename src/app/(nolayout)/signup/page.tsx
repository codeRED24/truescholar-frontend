"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { User, Mail, Eye, EyeOff, Lock, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Simplified signup schema for Better Auth
const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phoneNumber: z.string().min(10, "Please enter a valid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const password = watch("password", "");

  // Password strength calculation
  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);

    try {
      const phoneWithCode = `+${data.phoneNumber}`;

      const result = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        phoneNumber: phoneWithCode,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to create account");
        setIsSubmitting(false);
        return;
      }

      const { setSignupData, resetOtpState } = await import(
        "@/stores/signupStore"
      ).then((m) => m.useSignupStore.getState());
      resetOtpState();
      setSignupData({
        name: data.name,
        email: data.email,
        phoneNumber: phoneWithCode,
      });

      toast.success("Account created! Please verify your email and phone.");
      router.push("/otp");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row overflow-hidden shadow-xl min-h-screen">
        {/* Left Side - Image and Content */}
        <div className="w-full hidden lg:w-7/12 p-6 md:p-8 lg:p-12 lg:flex flex-col items-center justify-center relative">
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
          <div className="absolute bottom-0 -right-10 w-80 h-[520px] md:w-[400px] md:h-[600px] lg:w-[500px] lg:h-[750px] z-10">
            <Image
              src="/_0005.png"
              alt="Students"
              priority
              fetchPriority="high"
              width={700}
              height={1000}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute bottom-0 -right-36 w-80 h-[520px] md:w-[400px] md:h-[600px] lg:w-[500px] lg:h-[750px] z-10 pointer-events-none">
            <Image
              src="/_0028.png"
              alt="Students"
              priority
              fetchPriority="high"
              width={700}
              height={1000}
              className="w-full h-full object-contain"
            />
          </div>
          {/* Daily Dash Feature */}
          <div className="absolute bottom-8 left-8 z-20 flex flex-col items-center">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg w-full max-w-md border border-white/20">
              <Image
                src="/gift.gif"
                alt="Gift"
                width={40}
                height={40}
                className="w-20 h-20 md:w-20 md:h-20 object-contain absolute -left-5 z-[1000]"
              />
              <span className="text-white font-bold text-base md:text-lg pl-14">
                Introducing Our Daily Dash Feature!
              </span>
            </div>
            <div className="bg-white/10 w-[96%] rounded-lg p-4 md:p-6 max-w-md border-l border-r border-b rounded-t-none border-white/20">
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
                    <strong>Level Up:</strong> Keep the Daily Dash alive to
                    level up and unlock cool prizes. Reach milestones like 100
                    days, 200 days, and beyond for extra bonuses!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-5/12 bg-gradient-to-br from-white to-gray-100 p-6 md:p-8 flex flex-col justify-center">
          <Link href={"/"} className="text-3xl text-center mb-4 font-extrabold">
            True
            <span className="text-primary-main">Scholar</span>
          </Link>
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-pink-400 to-orange-500 [text-shadow:1px_1px_1px_rgba(0,0,0,0.08)]">
                GET STARTED
              </span>
            </h1>
            <p className="text-gray-600 text-xs md:text-sm">
              Begin your college journey now! Sign up to explore options
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 md:space-y-6"
          >
            <div className="grid grid-cols-1 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <User className="w-4 h-4 text-teal-500" />
                  Name <span className="text-teal-600">*</span>
                </Label>
                <Input
                  {...register("name")}
                  id="name"
                  placeholder="Enter your full name"
                  className={`border-gray-300 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Mail className="w-4 h-4 text-teal-500" />
                  Email <span className="text-teal-600">*</span>
                </Label>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className={`border-gray-300 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Phone className="w-4 h-4 text-teal-500" />
                  Contact Number <span className="text-teal-600">*</span>
                </Label>
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      country={"in"}
                      value={field.value}
                      onChange={(phone) => field.onChange(phone)}
                      inputProps={{
                        id: "phoneNumber",
                        required: true,
                      }}
                      containerClass="!w-full"
                      inputClass={`!w-full !h-10 !text-sm !border !border-gray-300 !rounded-md !pl-12 bg-transparent ${
                        errors.phoneNumber ? "!border-red-500" : ""
                      }`}
                      buttonClass="!border !border-gray-300 !border-r-0 !rounded-l-md !bg-transparent"
                      dropdownClass="!border !border-gray-300 !rounded-md !shadow-lg"
                      enableSearch
                      searchPlaceholder="Search country..."
                    />
                  )}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600">
                    {errors.phoneNumber.message}
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
                <div className="relative">
                  <Input
                    {...register("password")}
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
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}

                {/* Password strength indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i < getPasswordStrength()
                              ? strengthColors[getPasswordStrength() - 1]
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Strength:{" "}
                      {strengthLabels[getPasswordStrength() - 1] || "Very Weak"}
                    </p>
                  </div>
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
                <div className="relative">
                  <Input
                    {...register("confirmPassword")}
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
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword.message}
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
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="agreeToTerms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-px"
                    />
                    <label
                      htmlFor="agreeToTerms"
                      className="text-xs text-gray-600"
                    >
                      By signing up, you agree to our{" "}
                      <Link
                        href="/terms-and-conditions"
                        className="text-blue-600 hover:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy-policy"
                        className="text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                )}
              />
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600">
                  {errors.agreeToTerms.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-sm text-center">
              Already have an account?{" "}
              <Link href="/signin" className="text-blue-800 font-medium">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
