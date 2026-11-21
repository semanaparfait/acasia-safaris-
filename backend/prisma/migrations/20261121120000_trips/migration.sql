-- CreateTable
CREATE TABLE "Trip" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "tagline" TEXT,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" DATE,
    "endDate" DATE,
    "duration" TEXT,
    "groupSize" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "itinerary" JSONB NOT NULL DEFAULT '[]',
    "prices" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trip_active_startDate_idx" ON "Trip"("active", "startDate");
