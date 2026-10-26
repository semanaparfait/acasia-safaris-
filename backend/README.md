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
with their email and password.

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
| GET | `/api/packages` | website: published packages |
| GET | `/api/packages/all` | 🔒 drafts included |
| GET | `/api/packages/:id` | website (ids are UUIDs) |
| POST / PUT / DELETE | `/api/packages[/:id]` | 🔒 |
| GET | `/api/destinations[/:id]` | website |
| POST / PUT / DELETE | `/api/destinations[/:id]` | 🔒 |
| GET / POST / PUT / DELETE | `/api/workers[/:id]` | 🔒 `role` must be a role name from `/api/roles`; body may include `isAdmin` and `password` (min 8 chars, only to set a new one) |
| GET / POST / PUT / DELETE | `/api/roles[/:id]` | 🔒 `{ name, description }`. Renaming updates workers; a role in use cannot be deleted |
| POST | `/api/bookings` | website: `{ customer, email, phone?, country, packageId, startDate, travelers, notes? }`. End date and price are calculated by the server |
| GET / PATCH / DELETE | `/api/bookings[/:id]` | 🔒 PATCH body: `{ status?, payment?, notes? }` |
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
