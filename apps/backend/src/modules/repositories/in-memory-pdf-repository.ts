import { Injectable } from '@nestjs/common';
import { IPDFRepository } from '../interface/pdf-repository.interface';
import { PDFDocument } from '../interface/pdf-document.interface';
import * as fs from 'fs';
import * as path from 'path';
import * as pdf from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InMemoryPDFRepository implements IPDFRepository {
  private documents: Map<string, PDFDocument> = new Map();
  private uploadDir = './uploads';
  private folders: Map<string, { id: string; name: string }> = new Map();

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
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      filePath: filepath,
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

  async getOrCreateFolder(
    folderName: string,
  ): Promise<{ id: string; name: string }> {
    let folder = Array.from(this.folders.values()).find(
      (f) => f.name === folderName,
    );
    if (!folder) {
      folder = { id: uuidv4(), name: folderName };
      this.folders.set(folder.id, folder);
    }
    return folder;
  }
}
