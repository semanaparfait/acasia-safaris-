-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "replyPinAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "replyPinHash" TEXT,
ADD COLUMN     "replyPinLockedUntil" TIMESTAMP(3);
