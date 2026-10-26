"use client";

import { useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Star, Check, EyeOff, Trash2, Quote } from "lucide-react";
import { Avatar, Button, Card, EmptyState, PageHeader, StatusBadge, Tabs } from "../components/ui";
import type { Review } from "@/lib/types";
import { useReviewsStore } from "@/store/reviewsStore";

type Filter = "All" | Review["status"];

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} style={{ width: size, height: size }} className={i <= value ? "fill-[#c5a86d] text-[#c5a86d]" : "text-[#0a120b]/15"} />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  // Reviews are loaded by AdminShell; this page reads and moderates them
  const reviews = useReviewsStore((s) => s.reviews);
  const error = useReviewsStore((s) => s.error);
  const changeStatus = useReviewsStore((s) => s.setStatus);
  const deleteReview = useReviewsStore((s) => s.deleteReview);
  const [filter, setFilter] = useState<Filter>("All");

  const list = reviews.filter((r) => filter === "All" || r.status === filter);
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1);

  const setStatus = async (id: number, status: Review["status"]) => {
    try {
      await changeStatus(id, status);
      toast.success(status === "Published" ? "Review published to website" : `Review ${status.toLowerCase()}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteReview(id);
      toast.success("Review deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader title="Reviews" subtitle="Approve guest testimonials before they appear on the website." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-6 flex items-center gap-6">
          <div>
            <p className="text-4xl font-semibold tabular-nums">{avg.toFixed(1)}</p>
            <Stars value={Math.round(avg)} size={16} />
            <p className="text-xs text-[#0a120b]/50 mt-1">{reviews.length} reviews</p>
          </div>
          <ul className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((n) => {
              const count = reviews.filter((r) => r.rating === n).length;
              return (
                <li key={n} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-[#0a120b]/55">{n}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[#0a120b]/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-[#c5a86d]" style={{ width: `${(count / (reviews.length || 1)) * 100}%` }} />
                  </div>
                  <span className="w-4 text-right tabular-nums text-[#0a120b]/55">{count}</span>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card className="p-6">
          <p className="text-xs text-[#0a120b]/50">Waiting for approval</p>
          <p className="text-3xl font-semibold mt-1 tabular-nums">{reviews.filter((r) => r.status === "Pending").length}</p>
          <p className="text-xs text-[#0a120b]/45 mt-2">New reviews stay hidden until you approve them.</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs text-[#0a120b]/50">Live on website</p>
          <p className="text-3xl font-semibold mt-1 tabular-nums">{reviews.filter((r) => r.status === "Published").length}</p>
          <p className="text-xs text-[#0a120b]/45 mt-2">Shown in the Testimonials section on the home page.</p>
        </Card>
      </div>

      <div className="mb-5">
        <Tabs
          value={filter}
          onChange={setFilter}
          tabs={(["All", "Pending", "Published", "Hidden"] as Filter[]).map((s) => ({
            value: s,
            label: s,
            count: s === "All" ? reviews.length : reviews.filter((r) => r.status === s).length,
          }))}
        />
      </div>

      {error ? (
        <Card className="p-5 text-sm text-red-700">Could not load reviews: {error}</Card>
      ) : list.length === 0 ? (
        <Card><EmptyState title="No reviews in this view" /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((r) => (
            <Card key={r.id} className="p-5 flex flex-col">
              <div className="flex items-start gap-3">
                <Avatar name={r.name} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{r.name}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-[#0a120b]/50">{r.country} · {format(new Date(r.createdAt), "d MMM yyyy")}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Stars value={r.rating} />
                <span className="text-xs text-[#0a120b]/50 truncate">{r.packageTitle}</span>
              </div>
              <p className="relative mt-3 text-sm text-[#0a120b]/75 leading-relaxed pl-5">
                <Quote className="absolute left-0 top-0.5 size-3.5 text-[#c5a86d]" />
                {r.text}
              </p>
              <div className="mt-auto pt-4 flex gap-2">
                {r.status !== "Published" && (
                  <Button className="py-2" onClick={() => setStatus(r.id, "Published")}><Check className="size-4" /> Publish</Button>
                )}
                {r.status !== "Hidden" && (
                  <Button variant="secondary" className="py-2" onClick={() => setStatus(r.id, "Hidden")}><EyeOff className="size-4" /> Hide</Button>
                )}
                <Button
                  variant="ghost"
                  className="py-2 ml-auto hover:text-red-600"
                  onClick={() => remove(r.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
