/*
  Warnings:

  - A unique constraint covering the columns `[nameTest]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nameTest` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "nameTest" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Folder_nameTest_key" ON "Folder"("nameTest");
