-- Gallery albums: a name, a description and a cover photo. Every photo belongs to one album.
CREATE TABLE "GalleryAlbum" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "coverId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryAlbum_pkey" PRIMARY KEY ("id")
);

-- The photos already online keep their place: each category becomes an album
INSERT INTO "GalleryAlbum" ("name", "description", "updatedAt")
SELECT c, CASE c
    WHEN 'Wildlife' THEN 'Mountain gorillas, chimpanzees, the Big Five and the birds of our national parks.'
    WHEN 'Landscapes' THEN 'Volcanoes, misty forests, Lake Kivu and the thousand hills of Rwanda.'
    WHEN 'Culture' THEN 'Dance, art, crafts and the traditions of Rwanda and East Africa.'
    WHEN 'People' THEN 'The guides, communities and travelers who make every journey.'
    ELSE '' END,
  CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "category" AS c FROM "GalleryItem") AS categories;

ALTER TABLE "GalleryItem" ADD COLUMN "albumId" UUID;
UPDATE "GalleryItem" g SET "albumId" = a."id" FROM "GalleryAlbum" a WHERE a."name" = g."category";
ALTER TABLE "GalleryItem" ALTER COLUMN "albumId" SET NOT NULL;
ALTER TABLE "GalleryItem" DROP COLUMN "category";

CREATE INDEX "GalleryItem_albumId_idx" ON "GalleryItem"("albumId");
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "GalleryAlbum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
