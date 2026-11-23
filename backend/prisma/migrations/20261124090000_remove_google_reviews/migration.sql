-- Google reviews removed: undo 20261123150000_google_reviews_manual.
-- Reviews copied from Google by hand are deleted; reviews left on the website stay.
DELETE FROM "Review" WHERE "source" = 'Google';

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "source",
DROP COLUMN "sourceUrl";

-- DropTable (only held the Google rating)
DROP TABLE "Setting";
