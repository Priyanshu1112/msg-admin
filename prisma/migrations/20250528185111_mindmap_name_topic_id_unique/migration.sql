/*
  Warnings:

  - A unique constraint covering the columns `[name,topicId]` on the table `MindMap` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MindMap_name_topicId_key" ON "MindMap"("name", "topicId");
