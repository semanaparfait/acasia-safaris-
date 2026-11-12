// The company's social profiles (lib/company.ts). Nothing is shown until a link is filled in,
// so visitors never click an icon that goes nowhere.
import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { activeSocials, type SocialName } from "@/lib/company";

const ICONS: Record<SocialName, { icon: IconType; label: string }> = {
  facebook: { icon: FaFacebookF, label: "Facebook" },
  instagram: { icon: FaInstagram, label: "Instagram" },
  x: { icon: FaXTwitter, label: "X" },
  youtube: { icon: FaYoutube, label: "YouTube" },
  tiktok: { icon: FaTiktok, label: "TikTok" },
};

export default function SocialLinks({ className = "flex gap-3", linkClassName }: { className?: string; linkClassName: string }) {
  const socials = activeSocials();
  if (socials.length === 0) return null;
  return (
    <div className={className}>
      {socials.map(([name, href]) => {
        const { icon: Icon, label } = ICONS[name];
        return (
          <a key={name} href={href} aria-label={`Acacia Safaris on ${label}`} target="_blank" rel="noopener noreferrer" className={linkClassName}>
            <Icon size={15} />
          </a>
        );
      })}
    </div>
  );
}
