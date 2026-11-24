-- Files sent in the booking chat (photos, PDFs, quotations)
ALTER TABLE "BookingMessage" ADD COLUMN     "attachments" JSONB NOT NULL DEFAULT '[]';
