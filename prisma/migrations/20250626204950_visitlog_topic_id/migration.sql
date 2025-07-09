/*
  Warnings:

  - Added the required column `topicId` to the `VisitLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VisitLog" ADD COLUMN     "topicId" TEXT NOT NULL;
