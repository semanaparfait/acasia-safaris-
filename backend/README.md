# Acacia Safaris API

NestJS + Prisma + Neon (Postgres). Runs on http://localhost:4000/api

## Run it

```bash
cd backend
npm install            # also runs "prisma generate"
npm run start:dev      # starts the API and restarts on every save
```

`.env` holds the Neon connection and the admin key (copy `.env.example` on a new machine).

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
src/common/admin.guard.ts checks the x-admin-key header
src/<feature>/            one folder per feature:
    dto/                  what a request may contain (checked automatically)
    <feature>.controller  the URLs
    <feature>.service     the database work
    <feature>.module      connects the two
```

A request goes: **controller** (which URL?) → **DTO** (is the body valid?) → **service** (talk to the database) → JSON response.

To add a new feature, copy the `destinations` folder, rename it, add a model to the schema, run `npm run db:migrate`, and add the module to `app.module.ts`.

## Routes

🔒 = admin only, send the header `x-admin-key: <ADMIN_API_KEY from .env>`

| Method | URL | Who |
| --- | --- | --- |
| GET | `/api/packages` | website: published packages |
| GET | `/api/packages/all` | 🔒 drafts included |
| GET | `/api/packages/:id` | website |
| POST / PUT / DELETE | `/api/packages[/:id]` | 🔒 |
| GET | `/api/destinations[/:id]` | website |
| POST / PUT / DELETE | `/api/destinations[/:id]` | 🔒 |
| GET / POST / PUT / DELETE | `/api/workers[/:id]` | 🔒 |
| POST | `/api/bookings` | website: `{ customer, email, phone?, country, packageId, startDate, travelers, notes? }`. End date and price are calculated by the server |
| GET / PATCH / DELETE | `/api/bookings[/:id]` | 🔒 PATCH body: `{ status?, payment?, notes? }` |
| POST | `/api/messages` | website contact form: `{ name, email, subject, body }` |
| GET / PATCH / DELETE | `/api/messages[/:id]` | 🔒 PATCH body: `{ read?, starred? }` |

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
