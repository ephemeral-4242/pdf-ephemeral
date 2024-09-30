import { Injectable } from '@nestjs/common';
import { IPDFRepository } from './pdf-repository.interface';
import { PDFDocument } from './pdf-document.interface';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as pdf from 'pdf-parse';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PrismaPDFRepository implements IPDFRepository {
  constructor(private prisma: PrismaService) {}

  async save(file: Express.Multer.File): Promise<PDFDocument> {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    const filePath = path.join('uploads', filename);

    // Ensure upload directory exists
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads', { recursive: true });
    }

    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);

    const pdfDocument = await this.prisma.pDF.create({
      data: {
        id: filename,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        filePath: filePath,
        content: await this.extractText(file.buffer),
      },
    });

    return pdfDocument;
  }

  async getById(id: string): Promise<PDFDocument | null> {
    return this.prisma.pDF.findUnique({
      where: { id },
    });
  }

  async getAll(): Promise<PDFDocument[]> {
    return this.prisma.pDF.findMany();
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pDF.delete({
      where: { id },
    });
  }

  private async extractText(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer);
    return data.text;
  }
}
