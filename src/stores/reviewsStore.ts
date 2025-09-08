import { create } from "zustand";
import { getUserReviews, Review } from "../api/reviews/getUserReviews";

interface ReviewsState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  fetchReviews: (userId: number) => Promise<void>;
}

export const useReviewsStore = create<ReviewsState>((set) => ({
  reviews: [],
  isLoading: false,
  error: null,
  fetchReviews: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const reviews = await getUserReviews(userId);
      set({ reviews, isLoading: false });
    } catch (error) {
      set({
        error: "Failed to fetch reviews.",
        isLoading: false,
      });
    }
  },
}));
