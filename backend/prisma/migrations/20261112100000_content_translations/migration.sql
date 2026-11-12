-- AlterTable
ALTER TABLE "Destination" ADD COLUMN     "translations" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "translations" JSONB NOT NULL DEFAULT '{}';
