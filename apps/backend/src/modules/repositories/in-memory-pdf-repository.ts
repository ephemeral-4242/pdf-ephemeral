import { Injectable } from '@nestjs/common';
import { IPDFRepository } from './pdf-repository.interface';
import { PDFDocument } from './pdf-document.interface';
import * as fs from 'fs';
import * as path from 'path';
import * as pdf from 'pdf-parse';

@Injectable()
export class InMemoryPDFRepository implements IPDFRepository {
  private documents: Map<string, PDFDocument> = new Map();
  private uploadDir = './uploads';

  async save(file: Express.Multer.File): Promise<PDFDocument> {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    const filepath = path.join(this.uploadDir, filename);

    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Write file to disk
    fs.writeFileSync(filepath, file.buffer);

    const extractedText = await this.extractText(filename);

    const pdfDocument: PDFDocument = {
      id: filename,
      content: extractedText,
      uploadDate: new Date(),
    };

    this.documents.set(pdfDocument.id, pdfDocument);
    return pdfDocument;
  }

  async getById(id: string): Promise<PDFDocument | null> {
    return this.documents.get(id) || null;
  }

  async getAll(): Promise<PDFDocument[]> {
    return Array.from(this.documents.values());
  }

  async delete(id: string): Promise<void> {
    const document = this.documents.get(id);
    if (document) {
      const filepath = path.join(this.uploadDir, document.id);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      this.documents.delete(id);
    }
  }

  async extractText(id: string): Promise<string> {
    const filepath = path.join(this.uploadDir, id);
    if (!fs.existsSync(filepath)) {
      throw new Error('File not found');
    }

    const dataBuffer = fs.readFileSync(filepath);
    const pdfData = await pdf(dataBuffer);
    return pdfData.text;
  }
}
