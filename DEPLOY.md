# Putting Acacia Safaris online

The website goes on **Vercel**, the API on **Render**, the database and photos stay on **Neon**.
Everything is served over **https**, which phone QR scanning (Admin > Check-in) and payments need.

```
visitor ──https──> Vercel (website, /api is forwarded) ──https──> Render (API) ──> Neon (database + photos)
```

## 1. Before you start
- The code is on GitHub (Vercel and Render deploy from it, and redeploy on every push to `main`).
- GitHub Actions (`.github/workflows/ci.yml`) checks every push: if it shows a red cross, do not deploy.
- Have ready: the Neon database URLs, the Neon storage key, the Gmail app password, a long random
  `JWT_SECRET` is made by Render for you.

## 2. The API on Render
1. render.com > **New > Blueprint** > choose the repository. Render reads `render.yaml`.
2. Fill in the values it asks for (from `backend/.env`): `DATABASE_URL`, `DIRECT_URL`, the `AWS_…` storage
   values, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, the WhatsApp values, and:
   - `FRONTEND_URL` = the website address, e.g. `https://acaciasafaris.com`
     (several: separate with commas, the first one is used in email links)
   - `PUBLIC_API_URL` = the API's own address, e.g. `https://acacia-api.onrender.com`
3. Deploy. Each deploy applies new database changes first (`prisma migrate deploy`).
4. Check: `https://<api>/api/packages` shows the packages, `https://<api>/api/docs` the API docs.
5. The main admin: in Render > Shell, run `npm run admin:main` once (with the `OWNER_…` values set),
   or keep using the admin created on your computer (same database).

Keep the **starter** plan (paid): on the free plan the API sleeps, so the 8:00 reminder emails would not
be sent and the first visitor waits ~30 s.

## 3. The website on Vercel
1. vercel.com > **Add New > Project** > import the repository (root folder: the repository root).
2. Environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://<api>/api` (the Render address)
   - `NEXT_PUBLIC_SITE_URL` = `https://acaciasafaris.com` (the website's own address)
3. Deploy. Vercel serves images through its CDN worldwide.
4. Add your domain in Vercel > Domains, then set `FRONTEND_URL` on Render to it.

## 4. After the first deploy
- Visit `/sitemap.xml` and `/robots.txt`. Add the site in **Google Search Console** and submit the sitemap.
- Test on a phone: a booking, the confirmation email, scanning the QR code in Admin > Check-in.
- WhatsApp alerts need a permanent token (Meta Business > System users), not the 24-hour test token.

## Settings that matter online
| Where | Name | Why |
|---|---|---|
| Render | `TRUST_PROXY=2` | Request limits count each visitor's real address (Vercel + Render proxies) |
| Render | `NODE_ENV=production` | Login cookies are sent over https only |
| Render | `FRONTEND_URL` | Allowed website + links in emails |
| Vercel | `NEXT_PUBLIC_API_URL` | Where the website forwards `/api` and opens the live connection |
| Vercel | `NEXT_PUBLIC_SITE_URL` | Sitemap, Google, social previews |
