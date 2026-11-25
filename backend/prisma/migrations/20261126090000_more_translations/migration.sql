-- French and Swahili texts of special trips, gallery albums (and their photos) and team bios
ALTER TABLE "Trip" ADD COLUMN     "translations" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "GalleryAlbum" ADD COLUMN     "translations" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Worker" ADD COLUMN     "translations" JSONB NOT NULL DEFAULT '{}';
