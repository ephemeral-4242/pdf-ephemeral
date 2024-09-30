import { Injectable } from '@nestjs/common';
import { IPDFRepository } from './pdf-repository.interface';
import { PDFDocument } from './pdf-document.interface';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as pdf from 'pdf-parse';

@Injectable()
export class PrismaPDFRepository implements IPDFRepository {
  constructor(private prisma: PrismaService) {}

  async save(file: Express.Multer.File): Promise<PDFDocument> {
    console.log('save method called');

    const pdfDocument = await this.prisma.pDF.create({
      data: {
        id: file.filename,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        filePath: file.path,
        content: await this.extractText(file.buffer),
      },
    });

    console.log('pdfcouments', pdfDocument);
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
