-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "questionBundleId" TEXT;

-- CreateTable
CREATE TABLE "QuestionBundle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionBundle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuestionBundle" ADD CONSTRAINT "QuestionBundle_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_questionBundleId_fkey" FOREIGN KEY ("questionBundleId") REFERENCES "QuestionBundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
