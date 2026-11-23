// Loads Umami on the public website only (not the admin panel or the quick-reply pages).
// Set in .env.local (or the hosting settings):
//   NEXT_PUBLIC_UMAMI_WEBSITE_ID=<the id Umami gives you>
//   NEXT_PUBLIC_UMAMI_SRC=https://cloud.umami.is/script.js   (or your own Umami server)
//   NEXT_PUBLIC_UMAMI_DOMAINS=acaciasafaris.com              (optional: count only the live site)
// Without the id nothing is loaded.
import Script from "next/script";

const WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const SRC = process.env.NEXT_PUBLIC_UMAMI_SRC || "https://cloud.umami.is/script.js";

// Runs before every hit. Booking and review pages carry the visitor's private link
// (/my-booking/<token>): the token is replaced, so it never leaves the browser.
// Admin and quick-reply pages are not counted at all.
const BEFORE_SEND = `window.acaciaBeforeSend=function(type,p){
  var hide=function(u){return typeof u==="string"?u.replace(/\\/(my-booking|trip-review|reply)\\/[^/?#]+/g,"/$1/[link]"):u;};
  if(p&&typeof p.url==="string"&&/^\\/(admin|reply)(\\/|$)/.test(p.url))return null;
  if(p){p.url=hide(p.url);p.referrer=hide(p.referrer);}
  return p;
};`;

export default function Analytics() {
  if (!WEBSITE_ID) return null;
  return (
    <>
      <Script id="umami-before-send" strategy="afterInteractive">
        {BEFORE_SEND}
      </Script>
      <Script
        src={SRC}
        data-website-id={WEBSITE_ID}
        data-before-send="acaciaBeforeSend"
        data-exclude-search="true"
        data-domains={process.env.NEXT_PUBLIC_UMAMI_DOMAINS || undefined}
        strategy="afterInteractive"
      />
    </>
  );
}
