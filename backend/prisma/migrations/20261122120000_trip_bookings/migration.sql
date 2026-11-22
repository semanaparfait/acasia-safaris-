-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "seats" INTEGER;

-- CreateTable
CREATE TABLE "TripBooking" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tripId" UUID NOT NULL,
    "customer" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "option" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'per person',
    "currency" TEXT NOT NULL,
    "travelers" INTEGER NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',
    "payment" TEXT NOT NULL DEFAULT 'Unpaid',
    "notes" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TripBooking_tripId_status_idx" ON "TripBooking"("tripId", "status");

-- AddForeignKey
ALTER TABLE "TripBooking" ADD CONSTRAINT "TripBooking_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

