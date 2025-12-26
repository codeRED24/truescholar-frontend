"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { Eye, EyeOff, Mail, Lock, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

type LoginMethod = "email" | "phone";

// Schemas for each login method
const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(1, "Enter your password"),
});

type EmailFormData = z.infer<typeof emailSchema>;
type PhoneFormData = z.infer<typeof phoneSchema>;

export default function SigninPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();

  // Email form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  // Phone form
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: "",
      password: "",
    },
  });

  // Helper function to validate redirect URL
  const isValidRedirect = (url: string): boolean => {
    try {
      const redirectUrl = new URL(url, window.location.origin);
      return redirectUrl.origin === window.location.origin;
    } catch {
      return false;
    }
  };

  const handleSuccessfulLogin = () => {
    toast.success("Logged in successfully");

    // Check for stored redirect path
    const redirectTo = sessionStorage.getItem("redirectAfterLogin");
    if (redirectTo && isValidRedirect(redirectTo)) {
      sessionStorage.removeItem("redirectAfterLogin");
      router.push(redirectTo);
    } else {
      router.push("/");
    }
  };

  const onEmailSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);

    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        toast.error(result.error.message || "Invalid credentials");
        setIsSubmitting(false);
        return;
      }

      handleSuccessfulLogin();
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Failed to login. Please try again.");
      setIsSubmitting(false);
    }
  };

  const onPhoneSubmit = async (data: PhoneFormData) => {
    setIsSubmitting(true);

    try {
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;

      const result = await signIn.phoneNumber({
        phoneNumber: formattedPhone,
        password: data.password,
      });

      if (result.error) {
        toast.error(result.error.message || "Invalid credentials");
        setIsSubmitting(false);
        return;
      }

      handleSuccessfulLogin();
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Failed to login. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Split Layout */}
      <div className="flex flex-col lg:flex-row overflow-hidden shadow-xl min-h-screen">
        {/* Left Side - Image and Content */}
        <div className="w-full hidden lg:w-7/12 p-6 md:p-8 lg:p-12 lg:flex flex-col items-center justify-center relative">
          <Image
            src="/lock.png"
            alt="lock"
            priority
            fill
            className="w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 lg:w-[480px] lg:h-[480px] xl:w-[576px] xl:h-[576px] object-contain z-10 absolute rotate-[15deg] sm:rotate-[12deg] lg:rotate-[15deg] opacity-10 "
          />
          <div className="inset-0 absolute bg-gradient-to-b from-[#142D55] to-[#4777C4]"></div>
          {/* Logo */}
          <div className="absolute top-10 left-10">
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col text-right">
                <span className="text-orange-400 text-xl font-bold">READY</span>
                <span className="text-blue-300 text-xl font-bold">SET</span>
              </div>
              <span className="text-white text-8xl font-bold">SIGN IN</span>
            </div>
          </div>

          {/* 3D Characters */}
          <div className="absolute bottom-0 lg:right-28 xl:right-48 w-48 h-[300px] md:w-[280px] md:h-[400px] lg:w-[400px] lg:h-[550px] xl:w-[535px] xl:h-[737px] z-20">
            <Image
              src="/_0037.png"
              alt="Students"
              priority
              fetchPriority="high"
              width={535}
              height={737}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute bottom-0 -right-10 w-48 h-[320px] md:w-[280px] md:h-[420px] lg:w-[400px] lg:h-[625px] xl:w-[529px] xl:h-[822px] z-10">
            <Image
              src="/img_0005.png"
              alt="Students"
              priority
              fetchPriority="high"
              width={529}
              height={822}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="w-full lg:w-5/12 bg-gradient-to-br from-white to-gray-100 p-6 md:p-8 flex flex-col justify-center items-center">
          <div className="max-w-md w-full flex flex-col">
            <Link
              href={"/"}
              className="text-3xl text-center mb-4 font-extrabold"
            >
              True
              <span className="text-primary-main">Scholar</span>
            </Link>
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Log In
            </h2>
            <p className="text-center mb-6 text-sm">
              Back for more? Log in now to explore your options!
            </p>

            {/* Login Method Toggle */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                  loginMethod === "email"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("phone")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                  loginMethod === "phone"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Phone className="w-4 h-4" />
                Phone
              </button>
            </div>

            {/* Email Login Form */}
            {loginMethod === "email" && (
              <form
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Mail className="w-4 h-4 text-teal-500" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...emailForm.register("email")}
                    className={`border-gray-300 ${
                      emailForm.formState.errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-red-600">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Lock className="w-4 h-4 text-teal-500" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...emailForm.register("password")}
                      className={`border-gray-300 pr-10 ${
                        emailForm.formState.errors.password
                          ? "border-red-500"
                          : ""
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
                  {emailForm.formState.errors.password && (
                    <p className="text-sm text-red-600">
                      {emailForm.formState.errors.password.message}
                    </p>
                  )}

                  <div className="mt-2 text-sm">
                    Forget Password?{" "}
                    <a
                      href="/forgot-password"
                      className="text-blue-800 font-medium"
                    >
                      Regain Access Now!
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg"
                >
                  {isSubmitting ? "Signing in..." : "Sign in with Email"}
                </Button>
              </form>
            )}

            {/* Phone Login Form */}
            {loginMethod === "phone" && (
              <form
                onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="w-4 h-4 text-teal-500" />
                    Phone Number
                  </Label>
                  <PhoneInput
                    country={"in"}
                    value={phoneNumber}
                    onChange={(value) => {
                      setPhoneNumber(value);
                      phoneForm.setValue("phoneNumber", value);
                    }}
                    inputClass="!w-full !h-10 !text-base !bg-transparent !border-gray-300 !rounded-md"
                    containerClass="!w-full"
                    buttonClass="!border-gray-300 !rounded-l-md !bg-gray-50"
                    dropdownClass="!shadow-lg"
                    enableSearch
                    searchPlaceholder="Search country..."
                  />
                  {phoneForm.formState.errors.phoneNumber && (
                    <p className="text-sm text-red-600">
                      {phoneForm.formState.errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone-password"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Lock className="w-4 h-4 text-teal-500" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...phoneForm.register("password")}
                      className={`border-gray-300 pr-10 ${
                        phoneForm.formState.errors.password
                          ? "border-red-500"
                          : ""
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
                  {phoneForm.formState.errors.password && (
                    <p className="text-sm text-red-600">
                      {phoneForm.formState.errors.password.message}
                    </p>
                  )}

                  <div className="mt-2 text-sm">
                    Forget Password?{" "}
                    <a
                      href="/forgot-password"
                      className="text-blue-800 font-medium"
                    >
                      Regain Access Now!
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg"
                >
                  {isSubmitting ? "Signing in..." : "Sign in with Phone"}
                </Button>
              </form>
            )}

            <p className="text-sm text-center mt-4">
              First Time? Let's dive right in and get you{" "}
              <Link href={"/signup"} className="text-blue-800">
                Registered!
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
