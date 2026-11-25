-- Travel groups (Admin > Groups): a group's WhatsApp invite link and the messages sent to it
CREATE TABLE "TravelGroup" (
    "key" TEXT NOT NULL,
    "whatsappLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelGroup_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "GroupMessage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "groupKey" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "translated" BOOLEAN NOT NULL DEFAULT false,
    "sentBy" TEXT NOT NULL,
    "recipients" INTEGER NOT NULL,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GroupMessage_groupKey_createdAt_idx" ON "GroupMessage"("groupKey", "createdAt");
ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_groupKey_fkey" FOREIGN KEY ("groupKey") REFERENCES "TravelGroup"("key") ON DELETE CASCADE ON UPDATE CASCADE;
