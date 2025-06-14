-- DropForeignKey
ALTER TABLE "FlashCard" DROP CONSTRAINT "FlashCard_bundleId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_bundleId_fkey";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "tags" TEXT[];

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashCard" ADD CONSTRAINT "FlashCard_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
