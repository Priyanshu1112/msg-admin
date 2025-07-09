-- CreateTable
CREATE TABLE "RelatedTopic" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelatedTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RelatedTopic_fromId_idx" ON "RelatedTopic"("fromId");

-- CreateIndex
CREATE INDEX "RelatedTopic_toId_idx" ON "RelatedTopic"("toId");

-- CreateIndex
CREATE UNIQUE INDEX "RelatedTopic_fromId_toId_key" ON "RelatedTopic"("fromId", "toId");

-- AddForeignKey
ALTER TABLE "RelatedTopic" ADD CONSTRAINT "RelatedTopic_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedTopic" ADD CONSTRAINT "RelatedTopic_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
