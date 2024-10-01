/*
  Warnings:

  - You are about to drop the column `nameTest` on the `Folder` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Folder_nameTest_key";

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "nameTest";
