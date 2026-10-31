-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "fairPrice" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "quotationManual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rates" JSONB;
