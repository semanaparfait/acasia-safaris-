-- Starting roles (edit them later in Admin > Roles)
INSERT INTO "Role" ("name", "description", "updatedAt") VALUES
  ('Tour Guide', 'Leads guests on safaris, treks and city tours, and shares knowledge about wildlife and culture.', CURRENT_TIMESTAMP),
  ('Driver', 'Drives guests safely between destinations and looks after the safari vehicle.', CURRENT_TIMESTAMP),
  ('Tour Manager', 'Plans itineraries, coordinates guides, drivers and lodges, and makes sure every trip runs smoothly.', CURRENT_TIMESTAMP),
  ('Customer Support', 'Answers enquiries, handles bookings and helps guests before, during and after their trip.', CURRENT_TIMESTAMP),
  ('Admin', 'Runs the office: accounts, staff and the day-to-day management of Acacia Safaris.', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Any other role a worker already has becomes a role too, so no worker is left without one
INSERT INTO "Role" ("name", "updatedAt")
SELECT DISTINCT "role", CURRENT_TIMESTAMP FROM "Worker"
ON CONFLICT ("name") DO NOTHING;
