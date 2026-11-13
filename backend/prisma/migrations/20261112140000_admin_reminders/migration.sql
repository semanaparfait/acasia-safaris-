-- CreateTable
CREATE TABLE "AdminReminder" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT,
    "notes" TEXT,
    "bookingId" UUID,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "doneBy" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminReminder_date_idx" ON "AdminReminder"("date");

-- AddForeignKey
ALTER TABLE "AdminReminder" ADD CONSTRAINT "AdminReminder_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
