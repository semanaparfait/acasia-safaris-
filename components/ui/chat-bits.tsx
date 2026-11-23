// Small chat pieces shared by the WhatsApp card and the booking conversation
import SmartImage from "@/components/ui/smart-image";
import { initials, type ChatMember } from "@/lib/useChatMember";

// Three bouncing dots, like a chat app
export function TypingDots({ label, className = "bg-white" }: { label: string; className?: string }) {
  return (
    <div role="status" aria-label={label} className={`inline-flex items-center gap-1 rounded-2xl rounded-bl-md px-3.5 py-3 shadow-sm ${className}`}>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 rounded-full bg-[#0a120b]/40 animate-bounce motion-reduce:animate-none"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

// Round photo (or initials) with a green "online" dot
export function MemberAvatar({
  member,
  fallback,
  ringClass = "ring-white",
  className = "size-10 bg-white/15 text-white",
}: {
  member: ChatMember | null;
  fallback: React.ReactNode;
  ringClass?: string;
  className?: string;
}) {
  return (
    <span className="relative shrink-0">
      {member?.photo ? (
        <SmartImage src={member.photo} alt={member.name} sizes="40px" width={80} height={80} className={`${className} rounded-full object-cover`} />
      ) : (
        <span className={`${className} flex items-center justify-center rounded-full text-sm font-semibold`}>
          {member ? initials(member.name) : fallback}
        </span>
      )}
      {member && <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-[#25D366] ring-2 ${ringClass}`} />}
    </span>
  );
}
