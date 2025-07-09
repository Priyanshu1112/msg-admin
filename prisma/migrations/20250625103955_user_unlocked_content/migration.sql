/*
  Warnings:

  - Changed the type of `type` on the `Bundle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('MindMap', 'MCQ', 'FlashCard', 'Video');

-- AlterTable
ALTER TABLE "Bundle" DROP COLUMN "type",
ADD COLUMN     "type" "ContentType" NOT NULL;

-- DropEnum
DROP TYPE "BundleType";

-- CreateTable
CREATE TABLE "UserUnlockedContent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "resourceType" "ContentType" NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserUnlockedContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserUnlockedContent_userId_idx" ON "UserUnlockedContent"("userId");

-- CreateIndex
CREATE INDEX "UserUnlockedContent_resourceType_resourceId_idx" ON "UserUnlockedContent"("resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "UserUnlockedContent_userId_resourceType_resourceId_key" ON "UserUnlockedContent"("userId", "resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Bundle_name_topicId_type_key" ON "Bundle"("name", "topicId", "type");

-- AddForeignKey
ALTER TABLE "UserUnlockedContent" ADD CONSTRAINT "UserUnlockedContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
