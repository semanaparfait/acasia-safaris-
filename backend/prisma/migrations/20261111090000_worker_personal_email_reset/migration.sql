-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "personalEmail" TEXT,
ADD COLUMN     "resetAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resetCodeExpires" TIMESTAMP(3),
ADD COLUMN     "resetCodeHash" TEXT;
