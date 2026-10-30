-- AlterTable
ALTER TABLE "Destination" ADD COLUMN     "accommodations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "budgets" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "travelStyles" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "children" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BookingDestination" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "travelStyle" TEXT NOT NULL,
    "accommodation" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "bookingId" UUID NOT NULL,

    CONSTRAINT "BookingDestination_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BookingDestination" ADD CONSTRAINT "BookingDestination_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

