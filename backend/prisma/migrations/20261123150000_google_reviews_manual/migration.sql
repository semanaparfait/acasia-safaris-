-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'Website',
ADD COLUMN     "sourceUrl" TEXT;

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);
