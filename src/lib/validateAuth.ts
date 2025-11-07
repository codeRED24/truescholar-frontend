import { refreshToken } from "@/api/auth/auth";
import axios from "./axios";
import { cookies } from "next/headers";

export const validateAuth = async (): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> => {
  console.log("Validating the user");
  const cookieStore = await cookies();

  try {
    const res = await axios.get("/auth/me");

    console.log("Response from validate: ", res.data);
    return {
      success: true,
      user: res.data,
    };
  } catch (error: any) {
    console.log("Initial auth validation failed:", error);

    // If the error is 401, try to refresh the token
    if (error.response?.status === 401) {
      console.log("Access token expired, attempting to refresh...");
      try {
        await refreshToken();

        // If refresh succeeds, try the original request again
        const res = await axios.get("/auth/me");
        console.log("Token refreshed and validation successful:", res.data);
        return {
          success: true,
          user: res.data,
        };
      } catch (refreshError) {
        console.log("Token refresh failed:", refreshError);
        return {
          success: false,
          error: "Session expired. Please log in again.",
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  }
};

/**
 * Check if user has valid authentication tokens
 */
export const hasValidTokens = async (): Promise<boolean> => {
  const cookieStore = await cookies();
  return !!(cookieStore.get("accessToken") && cookieStore.get("refreshToken"));
};
