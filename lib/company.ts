// The company's contact details and social profiles, in one place for the whole website.
// A social network only appears on the website once its link is filled in here.

// "Write a review" on our Google profile (from Google Business Profile > Ask for reviews)
export const GOOGLE_REVIEW_URL = "https://g.page/r/CY9bcVmibpwmEBE/review";

export const COMPANY = {
  phone: "+250 798 635 578",
  phoneLink: "tel:+250798635578",
  whatsapp: "250798635578", // country code + number, digits only
  email: "info@acaciasafaris.com",
} as const;

// Paste the full profile links, e.g. "https://instagram.com/acaciasafaris". Empty = hidden.
export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/acaciasafaris",
  instagram: "https://www.instagram.com/acaciasafaris.rw?fqnt=MXkwN3kwOGVsY2Nqeg==",
  x: "https://x.com/acaciasafaris",
  youtube: "https://www.youtube.com/@acaciasafaris",
  tiktok: "https://www.tiktok.com/@acacia1safaris_rwanda?_r=1&_t=ZS-9BXoq4F7Bi9",
} as const;

export type SocialName = keyof typeof SOCIAL_LINKS;

// Only the networks with a link
export const activeSocials = () =>
  (Object.entries(SOCIAL_LINKS) as [SocialName, string][]).filter(([, href]) => href.trim() !== "");
