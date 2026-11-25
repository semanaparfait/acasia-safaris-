// The company's contact details and social profiles, in one place for the whole website.
// A social network only appears on the website once its link is filled in here.

export const COMPANY = {
  phone: "+250 798 635 578",
  phoneLink: "tel:+250798635578",
  whatsapp: "250798635578", // country code + number, digits only
  email: "info@acaciasafarisrwanda.com",
} as const;

// ✍️ The company's legal details. Used by the Terms of Service, the Privacy Policy, the footer and
// the company information Google reads. Type the numbers between the quotes, exactly as on your
// certificates. While one is empty, the pages simply leave it out.
export const COMPANY_LEGAL = {
  name: "Acacia Safaris Ltd",
  rdbLicence: "", // ✍️ Tourism licence number from RDB (Rwanda Development Board)
  registrationNumber: "", // ✍️ Company code / TIN from your RDB registration certificate
  address: "Kigali, Rwanda", // ✍️ Full address, e.g. "KG 7 Ave, Kacyiru, Kigali, Rwanda"
  website: "https://acaciasafarisrwanda.com",
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
