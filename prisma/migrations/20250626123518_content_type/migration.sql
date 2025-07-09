/*
  Warnings:

  - Changed the type of `resourceType` on the `VisitLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "VisitLog" DROP COLUMN "resourceType",
ADD COLUMN     "resourceType" "ContentType" NOT NULL;

-- DropEnum
DROP TYPE "VisitedResourceType";

-- CreateIndex
CREATE INDEX "VisitLog_resourceType_resourceId_idx" ON "VisitLog"("resourceType", "resourceId");
