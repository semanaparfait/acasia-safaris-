"use client";

// Admin > Reviews: our Google rating and reviews copied from Google, shown on the website
// while the Google API is not used (it needs a paid Google Cloud account). With the API
// working, the website shows Google's live data instead and this is only a fallback.
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ExternalLink, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { GOOGLE_REVIEW_URL } from "@/lib/company";
import { GoogleG } from "@/components/GoogleRating";
import { useReviewsStore } from "@/store/reviewsStore";
import { Button, Card, Modal, inputClass, labelClass } from "../components/ui";

type Profile = { rating: number; total: number; mapsUrl: string | null };

export default function GoogleSection() {
  const [profile, setProfile] = useState({ rating: "", total: "", mapsUrl: "" });
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api<Profile>("/google-reviews/profile", { admin: true })
      .then((p) =>
        setProfile({
          rating: p.rating ? String(p.rating) : "",
          total: p.total ? String(p.total) : "",
          mapsUrl: p.mapsUrl ?? "",
        }),
      )
      .catch(() => {});
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/google-reviews/profile", {
        method: "PUT",
        admin: true,
        body: { rating: Number(profile.rating), total: Number(profile.total), mapsUrl: profile.mapsUrl.trim() || undefined },
      });
      toast.success("Google rating saved. It shows on the website now.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <GoogleG className="size-7 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Google rating & reviews</p>
            <p className="text-xs text-[#0a120b]/50 max-w-xl">
              Copy them from your Google profile. The website shows the rating next to &quot;Book now&quot;, in the footer and on the
              home page, with the Google reviews you add. Update the numbers about once a month.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#0a120b]/10 px-3 py-2 text-xs font-medium hover:bg-[#0a120b]/5"
          >
            Open our Google profile <ExternalLink className="size-3.5" />
          </a>
          <Button className="py-2" onClick={() => setAdding(true)}>
            <Plus className="size-4" /> Add a Google review
          </Button>
        </div>
      </div>

      <form onSubmit={save} className="mt-4 grid grid-cols-1 sm:grid-cols-[110px_140px_1fr_auto] gap-3 items-end">
        <div>
          <label className={labelClass}>Rating</label>
          <input
            type="number"
            step="0.1"
            min={1}
            max={5}
            className={inputClass}
            value={profile.rating}
            onChange={(e) => setProfile({ ...profile, rating: e.target.value })}
            placeholder="4.9"
          />
        </div>
        <div>
          <label className={labelClass}>Number of reviews</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={profile.total}
            onChange={(e) => setProfile({ ...profile, total: e.target.value })}
            placeholder="132"
          />
        </div>
        <div>
          <label className={labelClass}>Link to our reviews on Google Maps (optional)</label>
          <input
            type="url"
            className={inputClass}
            value={profile.mapsUrl}
            onChange={(e) => setProfile({ ...profile, mapsUrl: e.target.value })}
            placeholder="https://maps.app.goo.gl/…"
          />
        </div>
        <Button type="submit" disabled={saving || !profile.rating || profile.total === ""}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </form>

      <AddGoogleReview open={adding} onClose={() => setAdding(false)} />
    </Card>
  );
}

function AddGoogleReview({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addGoogleReview = useReviewsStore((s) => s.addGoogleReview);
  const empty = { name: "", rating: 5, text: "", sourceUrl: "", postedAt: "" };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await addGoogleReview({
        name: form.name.trim(),
        rating: form.rating,
        text: form.text.trim(),
        sourceUrl: form.sourceUrl.trim() || undefined,
        postedAt: form.postedAt || undefined,
      });
      toast.success("Google review added to the website");
      setForm(empty);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a review from Google"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !form.name.trim() || !form.text.trim()}>
            {saving ? "Adding…" : "Add review"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-[#0a120b]/55">
          Copy a real review from our Google profile, word for word. It is published at once with the Google logo and a
          &quot;Read on Google&quot; link.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
          <div>
            <label className={labelClass}>Reviewer&apos;s name (as on Google)</label>
            <input className={inputClass} maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Stars</label>
            <select className={inputClass} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Review text</label>
          <textarea rows={5} maxLength={4000} className={`${inputClass} resize-none`} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_170px] gap-3">
          <div>
            <label className={labelClass}>Link to the review (optional)</label>
            <input
              type="url"
              className={inputClass}
              value={form.sourceUrl}
              onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
              placeholder="On Google: Share > Copy link"
            />
          </div>
          <div>
            <label className={labelClass}>Posted on (optional)</label>
            <input type="date" className={inputClass} value={form.postedAt} onChange={(e) => setForm({ ...form, postedAt: e.target.value })} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
