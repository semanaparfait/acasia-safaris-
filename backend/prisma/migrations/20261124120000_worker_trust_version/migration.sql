-- "Trust this device" has its own version: logging out keeps it, a new password ends it
ALTER TABLE "Worker" ADD COLUMN     "trustVersion" INTEGER NOT NULL DEFAULT 0;
