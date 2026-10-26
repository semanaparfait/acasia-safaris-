-- Every id becomes a UUID. Existing rows keep their data and get a new random id;
-- links from itinerary days and bookings to their package are carried over.
-- One transaction: if any step fails, nothing is changed.
BEGIN;

-- ---------- Package (+ the tables that point to it) ----------
ALTER TABLE "Package" ADD COLUMN "new_id" UUID NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE "ItineraryDay" ADD COLUMN "new_packageId" UUID;
UPDATE "ItineraryDay" d SET "new_packageId" = p."new_id" FROM "Package" p WHERE d."packageId" = p."id";

ALTER TABLE "Booking" ADD COLUMN "new_packageId" UUID;
UPDATE "Booking" b SET "new_packageId" = p."new_id" FROM "Package" p WHERE b."packageId" = p."id";

ALTER TABLE "ItineraryDay" DROP CONSTRAINT "ItineraryDay_packageId_fkey";
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_packageId_fkey";
DROP INDEX "ItineraryDay_packageId_day_key";

ALTER TABLE "ItineraryDay" DROP COLUMN "packageId";
ALTER TABLE "ItineraryDay" RENAME COLUMN "new_packageId" TO "packageId";
ALTER TABLE "ItineraryDay" ALTER COLUMN "packageId" SET NOT NULL;

ALTER TABLE "Booking" DROP COLUMN "packageId";
ALTER TABLE "Booking" RENAME COLUMN "new_packageId" TO "packageId";

ALTER TABLE "Package" DROP CONSTRAINT "Package_pkey";
ALTER TABLE "Package" DROP COLUMN "id";
ALTER TABLE "Package" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "Package" ADD CONSTRAINT "Package_pkey" PRIMARY KEY ("id");

-- ---------- Tables nothing points to: swap the id column ----------
ALTER TABLE "ItineraryDay" ADD COLUMN "new_id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "ItineraryDay" DROP CONSTRAINT "ItineraryDay_pkey";
ALTER TABLE "ItineraryDay" DROP COLUMN "id";
ALTER TABLE "ItineraryDay" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "ItineraryDay" ADD CONSTRAINT "ItineraryDay_pkey" PRIMARY KEY ("id");

ALTER TABLE "Destination" ADD COLUMN "new_id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "Destination" DROP CONSTRAINT "Destination_pkey";
ALTER TABLE "Destination" DROP COLUMN "id";
ALTER TABLE "Destination" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_pkey" PRIMARY KEY ("id");

ALTER TABLE "Worker" ADD COLUMN "new_id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "Worker" DROP CONSTRAINT "Worker_pkey";
ALTER TABLE "Worker" DROP COLUMN "id";
ALTER TABLE "Worker" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_pkey" PRIMARY KEY ("id");

ALTER TABLE "Role" ADD COLUMN "new_id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey";
ALTER TABLE "Role" DROP COLUMN "id";
ALTER TABLE "Role" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "Role" ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");

ALTER TABLE "Booking" ADD COLUMN "new_id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_pkey";
ALTER TABLE "Booking" DROP COLUMN "id";
ALTER TABLE "Booking" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_pkey" PRIMARY KEY ("id");

ALTER TABLE "Message" ADD COLUMN "new_id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "Message" DROP CONSTRAINT "Message_pkey";
ALTER TABLE "Message" DROP COLUMN "id";
ALTER TABLE "Message" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "Message" ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");

ALTER TABLE "Review" ADD COLUMN "new_id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "Review" DROP CONSTRAINT "Review_pkey";
ALTER TABLE "Review" DROP COLUMN "id";
ALTER TABLE "Review" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "Review" ADD CONSTRAINT "Review_pkey" PRIMARY KEY ("id");

ALTER TABLE "GalleryItem" ADD COLUMN "new_id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "GalleryItem" DROP CONSTRAINT "GalleryItem_pkey";
ALTER TABLE "GalleryItem" DROP COLUMN "id";
ALTER TABLE "GalleryItem" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id");

-- ---------- Put back the index and the links to Package ----------
CREATE UNIQUE INDEX "ItineraryDay_packageId_day_key" ON "ItineraryDay"("packageId", "day");
ALTER TABLE "ItineraryDay" ADD CONSTRAINT "ItineraryDay_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
