-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "minPrice" INTEGER;

-- AlterTable: existing bookings get a private link too
ALTER TABLE "Booking" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "floorAmount" INTEGER,
ADD COLUMN     "guests" JSONB,
ADD COLUMN     "listAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "needsReply" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "offer" INTEGER,
ADD COLUMN     "offerBy" TEXT;

UPDATE "Booking"
SET "accessToken" = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
    "listAmount" = "amount";

ALTER TABLE "Booking" ALTER COLUMN "accessToken" SET NOT NULL;

-- CreateTable
CREATE TABLE "BookingMessage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bookingId" UUID NOT NULL,
    "sender" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "offer" INTEGER,
    "event" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_accessToken_key" ON "Booking"("accessToken");

-- CreateIndex
CREATE INDEX "BookingMessage_bookingId_createdAt_idx" ON "BookingMessage"("bookingId", "createdAt");

-- AddForeignKey
ALTER TABLE "BookingMessage" ADD CONSTRAINT "BookingMessage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
