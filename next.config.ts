import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Translations: i18n/request.ts
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// The backend. NEXT_PUBLIC_API_URL is its address, e.g. https://api.example.com/api
// (the live connection in lib/live.ts uses it too).
const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/api\/?$/, "");
const BACKEND_URL = new URL(BACKEND);

// Security headers for every page of the website
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" }, // no guessing file types
  { key: "X-Frame-Options", value: "SAMEORIGIN" }, // other sites cannot show ours in a frame (clickjacking)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, // private links (/my-booking/…) are not leaked
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(self)" }, // camera: Admin > Check-in
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }, // https only (ignored on localhost)
];

const nextConfig: NextConfig = {
  // Photos are resized and compressed for each screen (and served by Vercel's CDN online).
  // Allowed sources: keep in sync with components/ui/smart-image.tsx
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      // Photos uploaded in the admin panel, served by the backend: <backend>/api/files/…
      {
        protocol: BACKEND_URL.protocol.replace(":", "") as "http" | "https",
        hostname: BACKEND_URL.hostname,
        port: BACKEND_URL.port,
        pathname: "/api/files/**",
      },
    ],
    // Locally the backend is on localhost, which Next.js refuses by default
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    formats: ["image/avif", "image/webp"],
  },

  // The website calls its own /api/…, and Next.js forwards it to the backend.
  // Same address as the page: the admin login cookie stays a first-party cookie.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND}/api/:path*` }];
  },

  // Old pages nothing links to: /about (old About us) and two empty placeholders
  async redirects() {
    return [
      { source: "/about", destination: "/aboutus", permanent: true },
      { source: "/:locale(fr|sw)/about", destination: "/:locale/aboutus", permanent: true },
      { source: "/pages/:path*", destination: "/", permanent: true },
      { source: "/:locale(fr|sw)/pages/:path*", destination: "/:locale", permanent: true },
    ];
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Private pages: never kept by shared caches
      { source: "/my-booking/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/:locale(fr|sw)/my-booking/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
};

export default withNextIntl(nextConfig);
