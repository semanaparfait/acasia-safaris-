-- AlterTable
ALTER TABLE "TripBooking" ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "receiptSentAt" TIMESTAMP(3),
ADD COLUMN     "ticketCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TripBooking_ticketCode_key" ON "TripBooking"("ticketCode");
