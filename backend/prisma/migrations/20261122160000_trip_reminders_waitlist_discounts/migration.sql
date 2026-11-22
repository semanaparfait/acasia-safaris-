-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "earlyBirdPercent" INTEGER,
ADD COLUMN     "earlyBirdUntil" DATE,
ADD COLUMN     "groupMinTravelers" INTEGER,
ADD COLUMN     "groupPercent" INTEGER;

-- AlterTable
ALTER TABLE "TripBooking" ADD COLUMN     "discountNote" TEXT,
ADD COLUMN     "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "reminderSentAt" TIMESTAMP(3),
ADD COLUMN     "reviewRequestAt" TIMESTAMP(3),
ADD COLUMN     "reviewToken" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "TripWaitlist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tripId" UUID NOT NULL,
    "customer" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "travelers" INTEGER NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripWaitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TripWaitlist_tripId_email_key" ON "TripWaitlist"("tripId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "TripBooking_reviewToken_key" ON "TripBooking"("reviewToken");

-- AddForeignKey
ALTER TABLE "TripWaitlist" ADD CONSTRAINT "TripWaitlist_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

