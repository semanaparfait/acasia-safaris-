// The social networks a worker can link on the About us page.
// Used by the admin worker form and the team pop-up on the website.
import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaSnapchat, FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6";
import type { SocialNetwork, Socials } from "./types";

export const SOCIAL_NETWORKS: { key: SocialNetwork; label: string; icon: IconType; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", icon: FaInstagram, placeholder: "https://instagram.com/username" },
  { key: "facebook", label: "Facebook", icon: FaFacebookF, placeholder: "https://facebook.com/username" },
  { key: "x", label: "X", icon: FaXTwitter, placeholder: "https://x.com/username" },
  { key: "tiktok", label: "TikTok", icon: FaTiktok, placeholder: "https://tiktok.com/@username" },
  { key: "youtube", label: "YouTube", icon: FaYoutube, placeholder: "https://youtube.com/@channel" },
  { key: "snapchat", label: "Snapchat", icon: FaSnapchat, placeholder: "https://snapchat.com/add/username" },
];

// "instagram.com/acacia" -> "https://instagram.com/acacia" (the API only accepts full links)
export function toLink(text: string) {
  const link = text.trim();
  if (!link) return "";
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

// Only the networks the worker uses, in the order above
export function usedSocials(socials: Socials | null | undefined) {
  return SOCIAL_NETWORKS.filter((s) => socials?.[s.key]).map((s) => ({ ...s, href: socials![s.key]! }));
}
