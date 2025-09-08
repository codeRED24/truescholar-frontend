export interface Review {
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
}

export const getUserReviews = async (userId: number): Promise<Review[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/reviews/user/${userId}`,
    { next: { revalidate: 60 * 2 } }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch reviews");
  }

  const data = await response.json();
  // The actual data is nested in a `data` property
  return data.data;
};
