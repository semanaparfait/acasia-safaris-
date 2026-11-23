-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "replyReminderAt" TIMESTAMP(3),
ADD COLUMN     "teamSeenAt" TIMESTAMP(3),
ADD COLUMN     "teamSeenBy" TEXT;

-- CreateTable
CREATE TABLE "SavedReply" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedReply_pkey" PRIMARY KEY ("id")
);

-- A few starters (edit or delete them in Admin > Settings > Saved replies)
INSERT INTO "SavedReply" ("title", "text", "updatedAt") VALUES
('Thank you', 'Thank you for your message! We are checking everything for your trip and will come back to you shortly with all the details.', CURRENT_TIMESTAMP),
('Itinerary on its way', 'Good news: we are preparing your detailed day-by-day itinerary and will send it to you today.', CURRENT_TIMESTAMP),
('Deposit', 'To confirm your booking, we ask for a deposit. Once it is received, your booking is confirmed and your ticket is sent to you by email.', CURRENT_TIMESTAMP),
('Anything else?', 'Is there anything else we can help you with? Special occasions, dietary needs or extra activities: just let us know.', CURRENT_TIMESTAMP);
