# Acacia Safaris API

NestJS + Prisma + Neon (Postgres). Runs on http://localhost:4000/api

## Run it

```bash
cd backend
npm install            # also runs "prisma generate"
npm run start:dev      # starts the API and restarts on every save
```

**API docs (Swagger):** http://localhost:4000/api/docs. Every route, with what to send and a "Try it out" button.
For routes with a lock: call `POST /api/auth/login`, copy the `token`, click **Authorize** and paste it.

`.env` holds the Neon connection, the storage keys and `JWT_SECRET` (copy `.env.example` on a new machine).

The website (Next.js, in the folder above) reads `NEXT_PUBLIC_API_URL` from its `.env.local`
(default `http://localhost:4000/api`).

## Admin login

Admins are **workers with "Admin access"** (their second role). They log in at `/admin/login`
with their company email and password.

Every worker has two emails:
- **Company email** (the login): made by the server from the first name, e.g. "Jean Bosco Habimana"
  → `jean@acaciasafaris.com` (a second Jean gets `jean2@`). It changes when the first name changes.
- **Personal email**: their own address. "Forgot password?" on the login page emails a 6 digit
  code there (needs the SMTP settings from "Quotation emails"). The code works for 15 minutes and
  5 tries; then they choose a new password and every other device is logged out.

There is one **main admin**. They cannot be deleted, always keep admin access, and are the only
one who can give or remove admin access (and set other admins' passwords). To create them, fill
these in `.env`, then run the command:

```
OWNER_NAME="Your Name"
OWNER_EMAIL="you@example.com"
OWNER_PASSWORD="at least 8 characters"
OWNER_PHONE="+250 7xx xxx xxx"
```

```bash
npm run admin:main
```

Run it again after changing `OWNER_PASSWORD` to reset the password. Putting another email there
makes that person the main admin instead. Other admins can still add and edit regular workers.

## Image uploads (Neon Storage)

Images are stored in the Neon buckets `tourpackages`, `destinations`, `gallery` and `workers`.
The buckets are private, so the website loads them through `GET /api/files/<bucket>/<key>`.

To turn uploads on, put your Neon storage credentials in `.env`
(Neon Console → Storage → Connect, or `neon credentials create --scope storage:read --scope storage:write`):

```
AWS_ENDPOINT_URL_S3="https://<branch>.storage.<region>.aws.neon.tech"
AWS_REGION="us-east-2"
AWS_ACCESS_KEY_ID="nak_live_..."
AWS_SECRET_ACCESS_KEY="nsk_live_..."
```

Without them everything else works; uploads answer "Storage is not configured".
When a record is deleted, its uploaded images are deleted from the bucket too.

## Quotation emails

Each package has a quotation PDF, made on the server from the package (`src/packages/quotation.service.ts`).
It is made when a package is created and remade each time it is saved. Admins can upload their own PDF instead (max 10 MB),
which is then left alone. Visitors can download it, or get it by WhatsApp or email.
Email requests are saved under Messages, and limited to 3 per address and 100 in total per hour.

To send with Gmail, turn on 2-Step Verification on the account, create an
[App password](https://myaccount.google.com/apppasswords), and put it in `.env` and in the hosting provider's environment variables:

```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="your-address@gmail.com"
SMTP_PASS="the 16 letter app password"
MAIL_FROM="Acacia Safaris <your-address@gmail.com>"
```

Without them the request is still saved under Messages, and the visitor is told to download the quotation instead.
`PUBLIC_API_URL` must be the real address of the API, because the PDF is attached from that URL.

## WhatsApp alerts

Each new booking sends a WhatsApp message to every active admin with a Rwandan number,
using the phone number on their worker record (`+250`, or starting with 0).
Admins with a foreign number are skipped.
A failed message is only logged: the booking is still saved.

1. In [Meta for Developers](https://developers.facebook.com/apps), create a Business app and add the WhatsApp product.
2. Add a phone number that is not already on the WhatsApp app, and note its Phone number ID.
3. In WhatsApp Manager, create a template named `new_booking` (category Utility, language English) and wait for approval:

   ```
   New booking on Acacia Safaris.
   Customer: {{1}} from {{2}}
   Phone: {{3}}
   Trip: {{4}}
   Dates: {{5}}
   Travelers: {{6}}
   Please review it in the admin panel.
   ```

4. Create a permanent access token (Business Settings → System users) with `whatsapp_business_messaging`.
5. Put them in `.env`, and in the hosting provider's environment variables:

```
WHATSAPP_TOKEN="..."
WHATSAPP_PHONE_NUMBER_ID="..."
WHATSAPP_TEMPLATE="new_booking"
WHATSAPP_TEMPLATE_LANGUAGE="en"
```

Without the token and the ID nothing is sent. Failed messages appear in the backend logs as `WhatsApp message failed`.

## Database commands

| Command | What it does |
| --- | --- |
| `npm run db:migrate` | After editing `prisma/schema.prisma`: updates the tables in Neon |
| `npm run db:seed` | Fills the database with the starting data (`prisma/seed-data.ts`). Safe to run again |
| `npm run db:studio` | Opens a web page to browse and edit the data |

## How the code is organised

```
prisma/schema.prisma      the tables
src/main.ts               starts the app (/api prefix, CORS, validation)
src/app.module.ts         lists every feature module
src/prisma/               the database connection (PrismaService)
src/auth/                 admin login (email + password -> token)
src/common/admin.guard.ts checks the login token on admin routes
src/<feature>/            one folder per feature:
    dto/                  what a request may contain (checked automatically)
    <feature>.controller  the URLs
    <feature>.service     the database work
    <feature>.module      connects the two
```

A request goes: **controller** (which URL?) → **DTO** (is the body valid?) → **service** (talk to the database) → JSON response.

To add a new feature, copy the `destinations` folder, rename it, add a model to the schema, run `npm run db:migrate`, and add the module to `app.module.ts`.

## Routes

🔒 = admin only, send the header `Authorization: Bearer <token>` (the token comes from `POST /api/auth/login`)

| Method | URL | Who |
| --- | --- | --- |
| POST | `/api/auth/login` | `{ email, password }` → `{ token, worker }` (active admins only) |
| GET | `/api/auth/me` | 🔒 the logged-in worker |
| PATCH | `/api/auth/me` | 🔒 edit your own account: `{ name?, personalEmail?, phone?, photo?, currentPassword? }`. `currentPassword` is needed to change the personal email |
| PATCH | `/api/auth/me/password` | 🔒 `{ currentPassword, newPassword }` → `{ token, worker }`. Other devices are logged out |
| POST | `/api/auth/logout` | 🔒 ends the login on every device (the token stops working) |
| POST | `/api/auth/forgot-password` | `{ email }` (company email) → emails a 6 digit code to the personal email. Same answer for every email; one email per minute |
| POST | `/api/auth/verify-reset-code` | `{ email, code }` → `{ valid: true }`, or 400 if wrong / expired (5 tries) |
| POST | `/api/auth/reset-password` | `{ email, code, newPassword }` → `{ token, worker }`. Uses up the code, logs out other devices |
| GET | `/api/packages` | website: published packages |
| GET | `/api/packages/all` | 🔒 drafts included |
| GET | `/api/packages/:id` | website (ids are UUIDs) |
| POST / PUT / DELETE | `/api/packages[/:id]` | 🔒 `quotation` is the URL of a PDF from `POST /api/uploads/tourpackages` |
| POST | `/api/packages/:id/quotation` | 🔒 makes the quotation PDF from the package, replacing the current one |
| POST | `/api/packages/:id/quotation/email` | website: `{ name, email }` sends the quotation by email |
| GET | `/api/destinations[/:id]` | website |
| POST / PUT / DELETE | `/api/destinations[/:id]` | 🔒 |
| GET | `/api/team` | website: workers with `showOnWebsite` (and Active) for the About us page: name, companyRole, photo, bio, personalEmail, phone, languages, socials |
| GET / POST / PUT / DELETE | `/api/workers[/:id]` | 🔒 send `personalEmail`, not `email` (the company email is made from the first name). About us fields: `showOnWebsite`, `companyRole` (needed when shown), `bio`, `socials: { youtube?, instagram?, x?, tiktok?, snapchat?, facebook? }` (full links). `role` must be a role name from `/api/roles`; body may include `isAdmin` and `password` (min 8 chars, only to set a new one) |
| GET / POST / PUT / DELETE | `/api/roles[/:id]` | 🔒 `{ name, description }`. Renaming updates workers; a role in use cannot be deleted |
| POST | `/api/bookings` | website (package bookings also send `guests: [{ label, count }]` per price group, and `offer?` + `offerNote?` to ask for a lower price): `{ customer, email, phone?, country, startDate, travelers, children?, notes? }` plus `packageId` (end date and price are calculated by the server) or `destinations: [{ title, travelStyle, accommodation, budget }]` + `endDate` (the admin sets the price later) |
| GET | `/api/bookings/track/:token` | website: the visitor's booking page (`/my-booking/<token>`, link emailed on booking): trip, price, offers and messages |
| GET | `/api/bookings/track/:token/qr` | website: the ticket QR code (PNG), once the booking is confirmed |
| POST | `/api/bookings/track/:token/messages` | website: `{ text?, offer? }` the visitor writes or proposes a lower price |
| POST | `/api/bookings/track/:token/accept` | website: accepts the team's price (or books at the full price) → Confirmed |
| POST | `/api/bookings/:id/messages` | 🔒 `{ text?, offer? }` reply or counter-offer; emails the visitor |
| POST | `/api/bookings/:id/accept` | 🔒 accepts the visitor's price → Confirmed; emails the visitor |
| GET | `/api/bookings/ticket/:code` | 🔒 Admin > Check-in: the booking of a ticket (the code, or the scanned `ACACIA:<code>`) |
| POST | `/api/bookings/ticket/:code/check-in` | 🔒 marks the travelers as arrived → `{ booking, alreadyCheckedIn }` |
| GET | `/api/packages/all/:id` | 🔒 one package with `minPrice` (the lowest bargaining price, never sent to the website) |
| GET / PATCH / DELETE | `/api/bookings[/:id]` | 🔒 PATCH body: `{ status?, payment?, amount?, notes? }` |
| POST | `/api/messages` | website contact form: `{ name, email, subject, body }` |
| GET / PATCH / DELETE | `/api/messages[/:id]` | 🔒 PATCH body: `{ read?, starred? }` |
| GET | `/api/reviews` | website: published reviews |
| GET | `/api/reviews/all` | 🔒 |
| POST | `/api/reviews` | website: `{ name, country, rating, packageTitle?, text }` (starts as Pending) |
| PATCH / DELETE | `/api/reviews/:id` | 🔒 PATCH body: `{ status: "Published" \| "Hidden" \| "Pending" }` |
| GET | `/api/gallery` | website |
| POST / PUT / DELETE | `/api/gallery[/:id]` | 🔒 `{ title, category, location?, image }` |
| POST | `/api/uploads/:bucket` | 🔒 multipart form, field `file`. Returns `{ url }` |
| GET | `/api/files/:bucket/:key` | website: serves an uploaded image |

A package is sent as one object with its days in order:

```json
{
  "title": "5-Day Classic Wildlife Safari",
  "category": "Wildlife Safari",
  "location": "Tanzania",
  "description": "...", "tripType": "Wildlife Safari", "lodging": "Comfort Lodges",
  "image": "https://...", "price": 1850, "active": true,
  "route": ["Serengeti NP", "Ngorongoro Rim"],
  "inclusions": ["..."], "exclusions": ["..."], "perks": [],
  "itinerary": [
    { "title": "Arrival", "description": "...", "image": "" },
    { "title": "Game drive", "description": "...", "image": "" }
  ]
}
```

The number of days is the length of `itinerary`; day numbers are given by the order.

## Live updates (WebSockets)

Socket.IO on the same port, namespace `/live` (allowed websites: `FRONTEND_URL`).
- The admin panel connects with `auth: { token }` and gets `booking` (every change) and `booking:deleted`.
- A visitor's booking page connects with `auth: { booking: <accessToken> }` and gets `booking`.
So new bookings, messages, offers, confirmations and check-ins show up instantly, without reloading.

## Confirmation and tickets

A booking is **Confirmed** when the visitor books at the full price (at once), when an offer is accepted,
or when an admin sets the status to Confirmed. It then gets a ticket code, and the visitor is emailed
the confirmation (trip, day by day itinerary, included / not included, price and deposit) with a **QR code**.
On the day, the team scans it in **Admin > Check-in** (the camera needs https or localhost; the code can also be typed).
Online payment is not built yet: the deposit text says the team sends the payment details.


## Request limits

Each visitor (IP address) can make 120 requests per minute. Stricter limits (see `src/common/limits.ts`):
admin login 5 per minute, "forgot password" 3 per 15 minutes, reset code 10 per 15 minutes,
website forms (booking, contact, review, quotation email) 5 per 10 minutes, booking chat 30 per minute.
Images (`/api/files`) and ticket QR codes have no limit. Over the limit: 429 "Too many attempts…".
Online behind a proxy, set `TRUST_PROXY=1` so each visitor's real IP is counted.

## Secrets

Real keys and passwords go only in `backend/.env` (ignored by git). `.env.example` is public: placeholders only.
