// 404 page: Next.js shows it for any address that does not exist
// (English; the French and Swahili site use app/[locale]/not-found.tsx).
import type { Metadata } from "next";
import NotFoundView from "@/components/NotFoundView";

export const metadata: Metadata = {
  title: "Page not found · Acacia Safaris",
};

export default function NotFound() {
  return <NotFoundView />;
}
