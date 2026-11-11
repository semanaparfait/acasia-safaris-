// Next.js 16 "proxy" (formerly middleware): picks the website's language.
// A first visit is sent to the visitor's browser language (/fr for French browsers);
// the choice from the language menu is remembered in a cookie.
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Not for the API, the admin panel, Next.js files or files with an extension (images…)
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
