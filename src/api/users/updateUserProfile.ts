import { BasicDetails } from "../../stores/profileStore";

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  contact_number?: string;
  country_of_origin?: string;
  user_location?: string;
  dob?: string;
  user_img_url?: string;
  college?: string;
}

export interface UpdateUserProfileResponse {
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
    updated_at: string;
  };
}

export const updateUserProfile = async (
  userId: number,
  profileData: BasicDetails,
  profilePicture?: File
): Promise<UpdateUserProfileResponse> => {
  const formData = new FormData();

  // Map frontend data to backend format
  const backendData: UpdateUserProfileRequest = {
    name: profileData.name,
    email: profileData.email,
    contact_number: profileData.phone,
    college: profileData.college,
  };

  // Parse country and location
  if (profileData.country) {
    const parts = profileData.country.split(", ");
    if (parts.length >= 2) {
      backendData.country_of_origin = parts[0];
      backendData.user_location = parts.slice(1).join(", ");
    } else {
      backendData.country_of_origin = profileData.country;
    }
  }

  // Parse birthday
  if (profileData.birthday) {
    const [day, month, year] = profileData.birthday.split(".");
    backendData.dob = `${year}-${month}-${day}`;
  }

  // Add data to form data
  Object.entries(backendData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });

  // Add profile picture if provided
  if (profilePicture) {
    formData.append("profilePicture", profilePicture);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
    {
      method: "PATCH",
      body: formData,
      // Note: Don't set Content-Type header when using FormData
      // Add authorization header if needed
      // headers: {
      //   'Authorization': `Bearer ${token}`,
      // },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update user profile: ${response.statusText}`);
  }

  return response.json();
};
