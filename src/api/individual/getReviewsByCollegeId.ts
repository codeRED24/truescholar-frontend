"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchReviewsByCollegeId = async (
  college_id: number,
  page: number,
  limit: number
) => {
  const url = `${API_URL}/reviews/college/${college_id}?page=${page}&limit=${limit}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 10800 },
    });
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching reviews by college ID:", error);
    return [];
  }
};

export const getReviewsByCollegeId = async (
  college_id: number,
  page: number,
  limit: number
) => {
  return fetchReviewsByCollegeId(college_id, page, limit);
};
