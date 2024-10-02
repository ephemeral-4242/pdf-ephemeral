import { Injectable, Inject } from '@nestjs/common';
import { Folder, Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as pdf from 'pdf-parse';
import * as path from 'path';
import { IPDFRepository } from '../interface/pdf-repository.interface';
import { PDFDocument } from 'src/types/pdf-document.type';
import {
  IFileService,
  FILE_SERVICE,
} from '../interface/file-service.interface';

@Injectable()
export class PrismaPDFRepository implements IPDFRepository {
  constructor(
    private prisma: PrismaService,
    @Inject(FILE_SERVICE) private diskService: IFileService,
  ) {}

  async save(
    file: Express.Multer.File,
    folderId?: string,
  ): Promise<PDFDocument> {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;

    let folderPath = 'uploads';
    if (folderId) {
      const folder = await this.prisma.folder.findUnique({
        where: { id: folderId },
      });
      if (folder) {
        folderPath = path.join('uploads', folder.name);
      }
    }

    const filePath = this.diskService.getFilePath(folderPath, filename);
    this.diskService.createFolder(folderPath);
    this.diskService.saveFile(filePath, file.buffer);

    const content = await this.extractText(file.buffer);

    const pdfDocument = await this.prisma.pDF.create({
      data: {
        id: filename,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        filePath: filePath,
        content: content,
        folderId: folderId,
      },
      include: {
        folder: true,
      },
    });

    return {
      ...pdfDocument,
      folder: pdfDocument.folder
        ? { id: pdfDocument.folder.id, name: pdfDocument.folder.name }
        : undefined,
    };
  }

  async getById(id: string): Promise<PDFDocument | null> {
    const pdf = await this.prisma.pDF.findUnique({
      where: { id },
      include: {
        folder: true,
      },
    });

    if (!pdf) return null;

    return {
      id: pdf.id,
      fileName: pdf.fileName,
      fileSize: pdf.fileSize,
      mimeType: pdf.mimeType,
      filePath: pdf.filePath,
      content: pdf.content,
      uploadDate: pdf.uploadDate,
      userId: pdf.userId,
      folder: pdf.folder
        ? { id: pdf.folder.id, name: pdf.folder.name }
        : undefined,
    };
  }

  async getAll(): Promise<PDFDocument[]> {
    const pdfs = await this.prisma.pDF.findMany({
      include: {
        folder: true,
      },
    });
    return pdfs.map((pdf) => ({
      id: pdf.id,
      fileName: pdf.fileName,
      fileSize: pdf.fileSize,
      mimeType: pdf.mimeType,
      filePath: pdf.filePath,
      content: pdf.content,
      uploadDate: pdf.uploadDate,
      userId: pdf.userId,
      folder: pdf.folder
        ? { id: pdf.folder.id, name: pdf.folder.name }
        : undefined,
    }));
  }

  async delete(id: string): Promise<void> {
    const pdf = await this.prisma.pDF.findUnique({ where: { id } });
    if (pdf) {
      this.diskService.deleteFile(pdf.filePath);
    }
    await this.prisma.pDF.delete({ where: { id } });
  }

  private async extractText(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer);
    return data.text;
  }

  async getFolders(): Promise<Folder[]> {
    return this.prisma.folder.findMany();
  }

  async getOrCreateFolder(
    folderName: string,
  ): Promise<{ id: string; name: string }> {
    const folder = await this.prisma.folder.upsert({
      where: { name: folderName },
      update: {},
      create: { name: folderName },
    });
    const folderPath = path.join('uploads', folderName);
    this.diskService.createFolder(folderPath);
    return { id: folder.id, name: folder.name };
  }

  async getAllFolders(): Promise<Folder[]> {
    return this.prisma.folder.findMany();
  }
}
