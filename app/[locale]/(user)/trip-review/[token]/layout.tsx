// A traveler's private review link (from the "How was it?" email): never shown in search engines
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leave a review | Acacia Safaris",
  robots: { index: false, follow: false },
};

export default function TripReviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
