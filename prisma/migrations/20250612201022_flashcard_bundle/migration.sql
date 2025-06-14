-- CreateTable
CREATE TABLE "FlashCardBundle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "tags" TEXT[],
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashCardBundle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlashCardBundle_year_idx" ON "FlashCardBundle"("year");

-- CreateIndex
CREATE INDEX "FlashCardBundle_tags_idx" ON "FlashCardBundle"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "FlashCardBundle_name_year_key" ON "FlashCardBundle"("name", "year");
