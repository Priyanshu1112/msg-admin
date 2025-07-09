-- AlterTable
ALTER TABLE "UserCompletedContent" ADD COLUMN     "completePercentage" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "UserCompletedContent" ADD CONSTRAINT "UserCompletedContent_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
