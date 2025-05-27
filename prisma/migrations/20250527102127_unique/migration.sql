/*
  Warnings:

  - A unique constraint covering the columns `[name,subjectId]` on the table `Chapter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,streamId]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,chapterId]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chapter_name_subjectId_key" ON "Chapter"("name", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_streamId_key" ON "Course"("name", "streamId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_chapterId_key" ON "Topic"("name", "chapterId");
