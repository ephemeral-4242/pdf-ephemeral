/*
  Warnings:

  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PDFToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PDFToTag" DROP CONSTRAINT "_PDFToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_PDFToTag" DROP CONSTRAINT "_PDFToTag_B_fkey";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "_PDFToTag";
