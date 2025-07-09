-- CreateTable
CREATE TABLE "UserCompletedContent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "resourceType" "ContentType" NOT NULL,
    "topicId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCompletedContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserCompletedContent_userId_idx" ON "UserCompletedContent"("userId");

-- CreateIndex
CREATE INDEX "UserCompletedContent_resourceType_resourceId_idx" ON "UserCompletedContent"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "UserCompletedContent_topicId_idx" ON "UserCompletedContent"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCompletedContent_userId_resourceType_resourceId_key" ON "UserCompletedContent"("userId", "resourceType", "resourceId");

-- AddForeignKey
ALTER TABLE "UserCompletedContent" ADD CONSTRAINT "UserCompletedContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
