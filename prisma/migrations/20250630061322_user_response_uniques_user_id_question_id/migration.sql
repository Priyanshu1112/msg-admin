/*
  Warnings:

  - A unique constraint covering the columns `[userId,questionId]` on the table `UserMCQResponse` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `UserMCQResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserMCQResponse" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserMCQResponse_userId_questionId_key" ON "UserMCQResponse"("userId", "questionId");
