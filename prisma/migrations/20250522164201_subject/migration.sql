/*
  Warnings:

  - Added the required column `country` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;
