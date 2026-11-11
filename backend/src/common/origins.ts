// Websites allowed to call this API (and open live connections) from the browser.
// FRONTEND_URL can hold several, separated by commas:
//   FRONTEND_URL="http://localhost:3000,https://acacia-safaris.vercel.app"
// The first one is the website used in email links.
export function allowedOrigins() {
  return (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((url) => url.trim().replace(/^["']|["']$/g, '')) // ignore quotes copied from .env
    .map((url) => url.replace(/\/$/, '')) // ignore a trailing "/"
    .filter(Boolean);
}
