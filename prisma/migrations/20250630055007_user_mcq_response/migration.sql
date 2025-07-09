-- CreateTable
CREATE TABLE "UserMCQResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "tags" TEXT[],
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMCQResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserMCQResponse_userId_idx" ON "UserMCQResponse"("userId");

-- CreateIndex
CREATE INDEX "UserMCQResponse_questionId_idx" ON "UserMCQResponse"("questionId");

-- CreateIndex
CREATE INDEX "UserMCQResponse_tags_idx" ON "UserMCQResponse"("tags");

-- AddForeignKey
ALTER TABLE "UserMCQResponse" ADD CONSTRAINT "UserMCQResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMCQResponse" ADD CONSTRAINT "UserMCQResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
