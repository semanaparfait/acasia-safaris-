-- What each admin may open in the admin panel (given by the main admin)
ALTER TABLE "Worker" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Admins who exist today keep the full access they had
UPDATE "Worker" SET "permissions" = ARRAY['statistics','bookings','calendar','departures','checkin','messages','packages','trips','destinations','reviews','gallery','workers']::TEXT[]
WHERE "isAdmin" = true;
