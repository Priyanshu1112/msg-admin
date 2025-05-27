/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - Made the column `streamId` on table `Subject` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Subject" ALTER COLUMN "streamId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");
