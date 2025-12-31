import { createAuthClient } from "better-auth/react";
import {
  organizationClient,
  adminClient,
  phoneNumberClient,
  emailOTPClient,
  oneTapClient,
} from "better-auth/client/plugins";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  basePath: "/api/auth",
  plugins: [
    organizationClient(),
    adminClient(),
    phoneNumberClient(),
    emailOTPClient(),
    oneTapClient({
      clientId: process.env.OAUTH_PUBLIC_GOOGLE_CLIENT_ID || "",
      autoSelect: false,
      cancelOnTapOutside: true,
      context: "signin",
    }),
  ],
  // Define additional user fields to match backend schema (enables type-safety for signup)
  user: {
    additionalFields: {
      college_id: {
        type: "number",
        required: false,
      },
      user_type: {
        type: "string",
        required: false,
      },
      gender: {
        type: "string",
        required: false,
      },
      dob: {
        type: "string", // Dates are passed as strings from the client
        required: false,
      },
      country_origin: {
        type: "string",
        required: false,
      },
      college_roll_number: {
        type: "string",
        required: false,
      },
      custom_code: {
        type: "string",
        required: false,
      },
      referred_by: {
        type: "string",
        required: false,
      },
    },
  },
});

// Export convenience hooks and functions
export const { signIn, signUp, signOut, useSession, getSession, updateUser } =
  authClient;

// Organization functions
export const { organization, useActiveOrganization, useListOrganizations } =
  authClient;

// Admin functions (for platform super admins)
export const { admin } = authClient;

// Phone OTP functions (from phoneNumberClient plugin)
export const phoneNumber = authClient.phoneNumber;

// Email OTP functions (from emailOTPClient plugin)
export const emailOTP = authClient.emailOtp;

// Email verification functions
export async function sendVerificationEmail(email: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/auth/send-verification-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      }
    );

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      return {
        data: null,
        error: { message: data.message || "Failed to send verification email" },
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Send verification email error:", error);
    return { data: null, error: { message: "An unexpected error occurred" } };
  }
}

export async function verifyEmailWithToken(token: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
      credentials: "include",
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      return {
        data: null,
        error: { message: data.message || "Failed to verify email" },
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Verify email error:", error);
    return { data: null, error: { message: "An unexpected error occurred" } };
  }
}

// Password reset functions - using direct API calls for compatibility
export async function requestPasswordReset({
  email,
  redirectTo,
}: {
  email: string;
  redirectTo?: string;
}) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/auth/request-password-reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, redirectTo }),
        credentials: "include",
      }
    );

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      return {
        data: null,
        error: { message: data.message || "Failed to send reset email" },
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Password reset error:", error);
    return { data: null, error: { message: "An unexpected error occurred" } };
  }
}

export async function resetPassword({
  newPassword,
  token,
}: {
  newPassword: string;
  token: string;
}) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newPassword, token }),
      credentials: "include",
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      return {
        data: null,
        error: { message: data.message || "Failed to reset password" },
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Reset password error:", error);
    return { data: null, error: { message: "An unexpected error occurred" } };
  }
}
