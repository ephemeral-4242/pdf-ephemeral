import { PDFDocument } from '../interface/pdf-document.interface';

export interface IPDFRepository {
  save(file: Express.Multer.File): Promise<PDFDocument>;
  getById(id: string): Promise<PDFDocument | null>;
  getAll(): Promise<PDFDocument[]>;
  delete(id: string): Promise<void>;
}

export const PDF_REPOSITORY = 'PDF_REPOSITORY';
