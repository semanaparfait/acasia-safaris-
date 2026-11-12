// /robots.txt: search engines may read the website, but not the admin panel, the API
// or travelers' private booking pages.
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/server-api";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/my-booking/", "/fr/my-booking/", "/sw/my-booking/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
