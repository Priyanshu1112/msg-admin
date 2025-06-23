/*
  Warnings:

  - You are about to drop the column `otp` on the `UserAuth` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserAuth" DROP COLUMN "otp",
ADD COLUMN     "otpSecret" TEXT;
