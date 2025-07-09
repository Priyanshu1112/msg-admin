-- CreateTable
CREATE TABLE "UserUnlockedSubject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserUnlockedSubject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserUnlockedSubject_userId_idx" ON "UserUnlockedSubject"("userId");

-- CreateIndex
CREATE INDEX "UserUnlockedSubject_subjectId_idx" ON "UserUnlockedSubject"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "UserUnlockedSubject_userId_subjectId_key" ON "UserUnlockedSubject"("userId", "subjectId");

-- AddForeignKey
ALTER TABLE "UserUnlockedSubject" ADD CONSTRAINT "UserUnlockedSubject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserUnlockedSubject" ADD CONSTRAINT "UserUnlockedSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
