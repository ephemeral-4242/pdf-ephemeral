import { Injectable } from '@nestjs/common';
import { IPDFRepository } from './pdf-repository.interface';
import { PDFDocument } from './pdf-document.interface';

@Injectable()
export class InMemoryPDFRepository implements IPDFRepository {
  private documents: Map<string, PDFDocument> = new Map();

  async save(pdfDocument: PDFDocument): Promise<void> {
    this.documents.set(pdfDocument.id, pdfDocument);
  }

  async getById(id: string): Promise<PDFDocument | null> {
    return this.documents.get(id) || null;
  }

  async getAll(): Promise<PDFDocument[]> {
    return Array.from(this.documents.values());
  }

  async delete(id: string): Promise<void> {
    this.documents.delete(id);
  }
}
