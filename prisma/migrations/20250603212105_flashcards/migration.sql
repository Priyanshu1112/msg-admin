/*
  Warnings:

  - You are about to drop the column `questionBundleId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `QuestionBundle` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BundleType" AS ENUM ('MindMap', 'MCQ', 'FlashCard', 'Video');

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_questionBundleId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionBundle" DROP CONSTRAINT "QuestionBundle_topicId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "questionBundleId",
ADD COLUMN     "bundleId" TEXT;

-- DropTable
DROP TABLE "QuestionBundle";

-- CreateTable
CREATE TABLE "Bundle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "type" "BundleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashCard" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "images" JSONB NOT NULL,
    "tags" TEXT[],
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bundleId" TEXT,

    CONSTRAINT "FlashCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bundle_name_topicId_type_key" ON "Bundle"("name", "topicId", "type");

-- AddForeignKey
ALTER TABLE "Bundle" ADD CONSTRAINT "Bundle_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashCard" ADD CONSTRAINT "FlashCard_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashCard" ADD CONSTRAINT "FlashCard_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
