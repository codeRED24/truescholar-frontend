export interface FormField {
  id: string
  label: string
  type: "text" | "email" | "select" | "textarea" | "file" | "rating" | "number"
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: any) => string | null
  }
  icon?: string
}

export interface FormStep {
  id: string
  title: string
  fields: FormField[]
}

// Example configuration - easily customizable
export const formConfig: FormStep[] = [
  {
    id: "personal-details",
    title: "Personal Details",
    fields: [
      {
        id: "name",
        label: "Name",
        type: "text",
        required: true,
        placeholder: "Enter your full name",
        icon: "User",
        validation: {
          minLength: 2,
          maxLength: 50,
        },
      },
      {
        id: "email",
        label: "Email ID",
        type: "email",
        required: true,
        placeholder: "Enter your email address",
        icon: "Mail",
        validation: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
      },
      {
        id: "gender",
        label: "Gender",
        type: "select",
        required: true,
        icon: "Users",
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" },
        ],
      },
      // Add more fields as needed
    ],
  },
  // Add more steps as needed
]

// Validation functions
export const validateField = (field: FormField, value: any): string | null => {
  if (field.required && (!value || value.toString().trim() === "")) {
    return `${field.label} is required`
  }

  if (field.validation) {
    const { minLength, maxLength, pattern, custom } = field.validation

    if (minLength && value.length < minLength) {
      return `${field.label} must be at least ${minLength} characters`
    }

    if (maxLength && value.length > maxLength) {
      return `${field.label} must not exceed ${maxLength} characters`
    }

    if (pattern && !pattern.test(value)) {
      return `${field.label} format is invalid`
    }

    if (custom) {
      return custom(value)
    }
  }

  return null
}

// Database schema for easy integration
export interface ReviewSubmission {
  id?: string
  created_at?: string

  // Personal Details
  name: string
  email: string
  gender: string
  contact_number: string
  country_code: string
  country_of_origin: string
  college_name: string
  college_location: string
  course_name: string
  graduation_year: string
  upi_id: string

  // Student Review
  profile_picture_url?: string
  linkedin_profile?: string
  student_id_url?: string
  mark_sheet_url?: string
  degree_certificate_url?: string

  // Ratings and Comments
  college_placement_rating: number
  college_placement_comment: string
  college_placement_title: string
  college_infrastructure_rating: number
  college_infrastructure_comment: string
  academic_experience_comment: string
  academic_quality_rating: number
  placement_journey_comment: string
  college_admission_rating: number
  admission_experience_comment: string
  campus_experience_comment: string

  // College Images
  college_images_urls: string[]

  // Status
  status: "pending" | "approved" | "rejected"
  reward_status: "pending" | "processed" | "paid"
}
