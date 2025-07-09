-- CreateEnum
CREATE TYPE "VisitedResourceType" AS ENUM ('MINDMAP', 'FLASHCARD_BUNDLE', 'QUESTION_BUNDLE', 'VIDEO');

-- CreateTable
CREATE TABLE "VisitLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "resourceType" "VisitedResourceType" NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitLog_userId_idx" ON "VisitLog"("userId");

-- CreateIndex
CREATE INDEX "VisitLog_resourceType_resourceId_idx" ON "VisitLog"("resourceType", "resourceId");

-- AddForeignKey
ALTER TABLE "VisitLog" ADD CONSTRAINT "VisitLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
