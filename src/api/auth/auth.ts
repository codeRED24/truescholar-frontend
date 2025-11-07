export interface SendOtpRequest {
  identifier: string; // email address
}

export interface SendOtpResponse {
  message: string;
  user_id: number;
}

export interface VerifyOtpRequest {
  identifier: string; // email address
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  verified: boolean;
}

export interface ResendOtpRequest {
  identifier: string; // email address
}

export interface CheckVerificationStatusRequest {
  identifier: string; // email address
}

export interface CheckVerificationStatusResponse {
  is_verified: boolean;
  verified_at?: string;
  pending_verification?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

if (!API_URL || !BEARER_TOKEN) {
  console.error(
    "⚠️ Missing API URL or Bearer token. Check environment variables."
  );
}

/**
 * Send email verification OTP
 */
export const sendEmailOtp = async (
  request: SendOtpRequest
): Promise<SendOtpResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_URL}/verification/send-email-otp`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to send OTP`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending email OTP:", error);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout: Failed to send OTP");
    }

    throw new Error(
      error instanceof Error ? error.message : "Failed to send OTP"
    );
  }
};

/**
 * Verify email OTP
 */
export const verifyEmailOtp = async (
  request: VerifyOtpRequest
): Promise<VerifyOtpResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_URL}/verification/verify-email-otp`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to verify OTP `);
    }

    return await response.json();
  } catch (error) {
    console.error("Error verifying email OTP:", error);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout: Failed to verify OTP");
    }

    throw new Error(
      error instanceof Error ? error.message : "Failed to verify OTP"
    );
  }
};

/**
 * Resend email verification OTP
 */
export const resendEmailOtp = async (
  request: ResendOtpRequest
): Promise<SendOtpResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_URL}/verification/resend-otp`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "email",
        identifier: request.identifier,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to resend OTP`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error resending email OTP:", error);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout: Failed to resend OTP");
    }

    throw new Error(
      error instanceof Error ? error.message : "Failed to resend OTP"
    );
  }
};

/**
 * Check email verification status
 */
export const checkEmailVerificationStatus = async (
  request: CheckVerificationStatusRequest
): Promise<CheckVerificationStatusResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_URL}/verification/check-status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "email",
        identifier: request.identifier,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Failed to check verification status`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking email verification status:", error);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout: Failed to check status");
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to check verification status"
    );
  }
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
}

/**
 * Login with email and password
 */
export const login = async (request: LoginRequest): Promise<LoginResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: request.email.toLowerCase(),
        password: request.password,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to login`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error logging in:", error);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout: Failed to login");
    }

    throw new Error(error instanceof Error ? error.message : "Failed to login");
  }
};

export const refreshToken = async (): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to refresh token`);
    }
    console.log("Token refreshed successfully");
    return response.json();
  } catch (error: any) {
    console.error("Token refresh error:", error);
    // If refresh fails, we need to clear auth state
    throw new Error("Token refresh failed");
  }
};

export interface getMeResponse {
  id: string;
  email: string;
  // name?: string;
  // user_type?: string;
}

export const getMe = async (): Promise<getMeResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to get user info`);
    }
    console.log("User info retrieved successfully");
    return response.json();
  } catch (error: any) {
    console.error("User info retreived:", error);
    throw new Error("User retrieved failed");
  }
};
