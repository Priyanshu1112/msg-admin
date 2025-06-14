/*
  Warnings:

  - A unique constraint covering the columns `[name,topicId]` on the table `QuestionBundle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "QuestionBundle_name_topicId_key" ON "QuestionBundle"("name", "topicId");
