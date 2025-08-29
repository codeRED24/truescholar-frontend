export interface CreateUserRequest {
  name: string;
  email?: string;
  gender?: string;
  contact_number?: string;
  country_of_origin?: string;
  college_roll_number?: string;
  iAm?: string;
  college?: string;
  college_id?: number;
  course_id?: number;
  college_location?: string;
  user_location?: string;
  pass_year?: number;
  dob?: string;
  user_type?: string;
  user_img_url?: string;
  custom_code?: string;
  password?: string;
  referred_by?: string;
}

export interface CreateUserResponse {
  message: string;
  data: {
    id: number;
    name: string;
    email?: string;
    gender?: string;
    contact_number?: string;
    country_of_origin?: string;
    college_roll_number?: string;
    iAm?: string;
    college_id?: number;
    course_id?: number;
    college_location?: string;
    user_location?: string;
    pass_year?: number;
    dob?: string;
    user_type?: string;
    user_img_url?: string;
    custom_code?: string;
    created_at: string;
    updated_at: string;
  };
  status: number; // Add status code to determine if user is new or existing
}

export const createUser = async (
  userData: CreateUserRequest
): Promise<CreateUserResponse> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

  if (!API_URL || !BEARER_TOKEN) {
    console.error(
      "⚠️ Missing API URL or Bearer token. Check environment variables."
    );
    throw new Error("API URL or Bearer token is missing.");
  }

  const requestUrl = `${API_URL}/auth/signup`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `Failed to create user with status ${response.status}`
      );
    }

    const data = await response.json();
    return {
      ...data,
      status: response.status,
    };
  } catch (error) {
    console.error("Error in createUser:", error);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "Request timeout: Failed to create user within 30 seconds"
      );
    }

    throw new Error(
      error instanceof Error ? error.message : "Failed to create user"
    );
  }
};
