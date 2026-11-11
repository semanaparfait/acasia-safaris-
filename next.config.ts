import type { NextConfig } from "next";

// The backend. NEXT_PUBLIC_API_URL is its address, e.g. https://api.example.com/api
// (the live connection in lib/live.ts uses it too).
const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/api\/?$/, "");

// Security headers for every page of the website
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" }, // no guessing file types
  { key: "X-Frame-Options", value: "SAMEORIGIN" }, // other sites cannot show ours in a frame (clickjacking)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, // private links (/my-booking/…) are not leaked
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(self)" }, // camera: Admin > Check-in
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }, // https only (ignored on localhost)
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
    ],
  },

  // The website calls its own /api/…, and Next.js forwards it to the backend.
  // Same address as the page: the admin login cookie stays a first-party cookie.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND}/api/:path*` }];
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Private pages: never kept by shared caches
      { source: "/my-booking/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
};

export default nextConfig;
