// The saved replies as small buttons above a reply box (admin panel and quick reply)
import { Zap } from "lucide-react";
import type { SavedReply } from "@/lib/types";

export function SavedReplyChips({ replies, onPick }: { replies: SavedReply[]; onPick: (text: string) => void }) {
  if (replies.length === 0) return null;
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
      <span className="flex shrink-0 items-center text-[#0a120b]/35" title="Saved replies">
        <Zap className="size-3.5" />
      </span>
      {replies.map((r) => (
        <button
          key={r.id}
          type="button"
          title={r.text}
          onClick={() => onPick(r.text)}
          className="shrink-0 rounded-full border border-[#0a120b]/10 bg-white px-3 py-1 text-xs text-[#0a120b]/70 transition-colors hover:border-[#c5a86d] hover:text-[#0a120b] cursor-pointer"
        >
          {r.title}
        </button>
      ))}
    </div>
  );
}
