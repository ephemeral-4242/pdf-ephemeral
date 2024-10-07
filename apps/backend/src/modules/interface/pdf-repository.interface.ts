import { PDFDocument } from 'src/types/pdf-document.type';

export interface IPDFRepository {
  save(
    file: Express.Multer.File,
    folderId?: string,
    relativePath?: string,
  ): Promise<PDFDocument>;
  getById(id: string): Promise<PDFDocument | null>;
  getAll(): Promise<PDFDocument[]>;
  delete(id: string): Promise<void>;
  getOrCreateFolder(folderName: string): Promise<{ id: string; name: string }>;
  getAllFolders(): Promise<any[]>;
}

export const PDF_REPOSITORY = 'PDF_REPOSITORY';
