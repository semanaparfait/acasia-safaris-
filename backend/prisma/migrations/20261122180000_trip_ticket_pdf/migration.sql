-- AlterTable
ALTER TABLE "TripBooking" ADD COLUMN     "ticketToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TripBooking_ticketToken_key" ON "TripBooking"("ticketToken");

