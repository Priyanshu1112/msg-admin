/*
  Warnings:

  - Added the required column `name` to the `MindMap` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MindMap" ADD COLUMN     "name" TEXT NOT NULL;
