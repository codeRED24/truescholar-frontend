export interface ReviewDetail {
  id: number;
  review_title: string;
  overall_experience_feedback: string;
  created_at: string;
  status: string;
  college: {
    college_name: string;
  } | null;
  collegeCourse: {
    name: string;
  } | null;
  college_location?: string;
  pass_year?: number;
  linkedin_profile?: string;
  annual_tuition_fees?: number;
  hostel_fees?: number;
  other_charges?: number;
  scholarship_availed?: boolean;
  scholarship_name?: string;
  scholarship_amount?: number;
  overall_satisfaction_rating?: number;
  teaching_quality_rating?: number;
  teaching_quality_feedback?: string;
  infrastructure_rating?: number;
  infrastructure_feedback?: string;
  library_rating?: number;
  library_feedback?: string;
  placement_support_rating?: number;
  placement_support_feedback?: string;
  administrative_support_rating?: number;
  administrative_support_feedback?: string;
  hostel_rating?: number;
  hostel_feedback?: string;
  extracurricular_rating?: number;
  extracurricular_feedback?: string;
  improvement_suggestions?: string;
  college_images_urls?: string[];
  degree_certificate_url?: string;
  mark_sheet_url?: string;
  student_id_url?: string;
}

export const getReview = async (id: number): Promise<ReviewDetail> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/reviews/${id}`,
    { next: { revalidate: 60 * 60 } }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch review");
  }

  const data = await response.json();
  return data;
};
