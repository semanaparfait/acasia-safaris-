-- CreateTable
CREATE TABLE "Departure" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "packageId" UUID NOT NULL,
    "startDate" DATE NOT NULL,
    "seats" INTEGER NOT NULL,
    "note" TEXT,
    "open" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Departure_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "departureId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Departure_packageId_startDate_key" ON "Departure"("packageId", "startDate");

-- CreateIndex
CREATE INDEX "Departure_startDate_idx" ON "Departure"("startDate");

-- AddForeignKey
ALTER TABLE "Departure" ADD CONSTRAINT "Departure_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_departureId_fkey" FOREIGN KEY ("departureId") REFERENCES "Departure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
