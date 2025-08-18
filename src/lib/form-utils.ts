/**
 * Helper function to format form data for backend submission
 * This function shows how the college and course will be sent as IDs
 * while maintaining the display names for user reference
 */

interface BackendFormData {
  // Personal Details with IDs for backend
  name: string;
  email: string;
  gender: string;
  contactNumber: string;
  countryOfOrigin: string;
  collegeId: number; // This is what backend needs
  courseId: number; // This will be college_wise_course_id from the API
  graduationYear: string;
  upiId: string;

  // Display names for reference (optional, depends on backend needs)
  collegeName?: string;
  courseName?: string;
  collegeLocation?: string;

  // Verification status
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

/**
 * Transforms the frontend form data to backend-compatible format
 */
export function formatFormDataForBackend(formData: any): BackendFormData {
  return {
    name: formData.name,
    email: formData.email,
    gender: formData.gender,
    contactNumber: formData.contactNumber,
    countryOfOrigin: formData.countryOfOrigin,
    collegeId: formData.collegeId,
    courseId: formData.courseId, // This will contain college_wise_course_id
    graduationYear: formData.graduationYear,
    upiId: formData.upiId,
    isEmailVerified: formData.isEmailVerified,
    isPhoneVerified: formData.isPhoneVerified,

    // Optional display names for reference
    collegeName: formData.collegeName,
    courseName: formData.courseName,
    collegeLocation: formData.collegeLocation,
  };
}

/**
 * Example usage:
 *
 * const backendData = formatFormDataForBackend(formData);
 *
 * // This will send:
 * // {
 * //   name: "John Doe",
 * //   email: "john@example.com",
 * //   collegeId: 7004477,                     // <- Backend gets the college ID as number
 * //   courseId: 105445,                       // <- Backend gets the college_wise_course_id as number
 * //   collegeName: "IIT Madras (IITM)",       // <- Display name for reference
 * //   courseName: "B.Tech. in Computer Science and Engineering" // <- Display name for reference
 * //   ...
 * // }
 */
