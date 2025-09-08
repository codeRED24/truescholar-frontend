import { BasicDetails } from "../../stores/profileStore";

export interface UserProfileResponse {
  message: string;
  data: {
    id: number;
    custom_code?: string;
    name?: string;
    email?: string;
    gender?: string;
    contact_number?: string;
    country_of_origin?: string;
    college_roll_number?: string;
    user_location?: string;
    dob?: string;
    user_type?: string;
    user_img_url?: string;
    college?: string;
    created_at: string;
  };
}

export const getUserProfile = async (
  userId: number
): Promise<UserProfileResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/profile/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }

  return response.json();
};

export const mapBackendToFrontend = (
  backendData: UserProfileResponse["data"]
): BasicDetails => {
  return {
    name: backendData.name || "",
    date: new Date(backendData.created_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    country:
      backendData.country_of_origin && backendData.user_location
        ? `${backendData.country_of_origin}, ${backendData.user_location}`
        : backendData.country_of_origin || backendData.user_location || "",
    birthday: backendData.dob
      ? new Date(backendData.dob)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, ".")
      : "",
    email: backendData.email || "",
    phone: backendData.contact_number || "",
    college: backendData.college || "",
  };
};
