// Guest reviews. The website shows published ones; the admin moderates them.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/api";
import type { Review, ReviewStatus } from "@/lib/types";

type ReviewsState = {
  reviews: Review[];
  loading: boolean;
  error: string | null;

  loadPublished: () => Promise<void>; // website
  loadAll: () => Promise<void>; // admin
  setStatus: (id: string, status: ReviewStatus) => Promise<void>; // admin
  deleteReview: (id: string) => Promise<void>; // admin
};

export const useReviewsStore = create<ReviewsState>()(
  devtools(
    (set) => ({
      reviews: [],
      loading: false,
      error: null,

      loadPublished: async () => {
        set({ loading: true, error: null }, false, "reviews/load/start");
        try {
          const reviews = await api<Review[]>("/reviews");
          set({ reviews, loading: false }, false, "reviews/load/success");
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, "reviews/load/error");
        }
      },

      loadAll: async () => {
        set({ loading: true, error: null }, false, "reviews/loadAll/start");
        try {
          const reviews = await api<Review[]>("/reviews/all", { admin: true });
          set({ reviews, loading: false }, false, "reviews/loadAll/success");
        } catch (error) {
          set({ error: (error as Error).message, loading: false }, false, "reviews/loadAll/error");
        }
      },

      setStatus: async (id, status) => {
        const updated = await api<Review>(`/reviews/${id}`, { method: "PATCH", body: { status }, admin: true });
        set(
          (state) => ({ reviews: state.reviews.map((r) => (r.id === id ? updated : r)) }),
          false,
          "reviews/setStatus",
        );
      },

      deleteReview: async (id) => {
        await api(`/reviews/${id}`, { method: "DELETE", admin: true });
        set((state) => ({ reviews: state.reviews.filter((r) => r.id !== id) }), false, "reviews/delete");
      },
    }),
    { name: "reviews" },
  ),
);
