-- CreateTable
CREATE TABLE "PDF" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "PDF_pkey" PRIMARY KEY ("id")
);
