-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "companyRole" TEXT,
ADD COLUMN     "showOnWebsite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "socials" JSONB NOT NULL DEFAULT '{}';
