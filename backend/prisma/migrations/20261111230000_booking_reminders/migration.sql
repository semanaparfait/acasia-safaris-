-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "balanceReminderAt" TIMESTAMP(3),
ADD COLUMN     "reviewRequestAt" TIMESTAMP(3),
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "tripReminderAt" TIMESTAMP(3);
