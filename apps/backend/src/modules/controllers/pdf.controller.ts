import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Res,
  Body,
  BadRequestException,
  Req,
  Get,
  NotFoundException,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PdfService } from '../services/pdf.service';
import { Request, Response } from 'express';
import { RateLimitError } from 'openai';
import { Logger } from '@nestjs/common';

@Controller('pdf')
export class PdfController {
  private readonly logger = new Logger(PdfController.name);

  constructor(private readonly pdfService: PdfService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body('folderId') folderId: string, // Changed from folderName to folderId
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    this.logger.log('File upload initiated');

    const pdfDocument = await this.pdfService.processAndSavePdf(
      file,
      folderId, // Changed from folderName to folderId
    );

    this.logger.log('PDF processed and saved');

    const fileUrl = `${req.protocol}://${req.get('host')}/${pdfDocument.filePath}`;
    this.logger.log(`File URL generated: ${fileUrl}`);
    this.logger.log(`File path: ${pdfDocument.filePath}`);
    res.status(200).json({
      message: 'PDF uploaded and text extracted.',
      url: fileUrl,
      folder: pdfDocument.folder,
    });
  }

  @Post('upload-folder')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFolder(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folderName') folderName: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    console.log('hereeee?????');
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    if (!folderName) {
      throw new BadRequestException('Folder name is required');
    }
    this.logger.log('Folder upload initiated');

    const pdfDocuments = await this.pdfService.processAndSaveFolder(
      files,
      folderName,
    );

    this.logger.log('Folder processed and saved');

    const fileUrls = pdfDocuments.map(
      (doc) => `${req.protocol}://${req.get('host')}/${doc.filePath}`,
    );
    res.status(200).json({
      message: 'Folder uploaded and processed successfully.',
      urls: fileUrls,
      folderName: folderName,
    });
  }

  @Get('folders')
  async getAllFolders(@Res() res: Response) {
    try {
      const folders = await this.pdfService.getAllFolders();
      res.status(200).json(folders);
    } catch (error) {
      console.error('Error retrieving folders:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  @Post('chat')
  async chatWithPdf(
    @Body('question') question: string,
    @Body('pdfId') pdfId: string,
    @Res() res: Response,
  ) {
    if (!question || !pdfId) {
      throw new BadRequestException('Question and PDF ID are required');
    }
    await this.pdfService.chatWithPdfStream(question, pdfId, res);
  }

  @Post('library-chat')
  async chatWithLibrary(
    @Body('question') question: string,
    @Res() res: Response,
  ) {
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    try {
      await this.pdfService.chatWithLibrary(question, res);
      // The response is handled within the service method, so we don't need to do anything here
    } catch (error) {
      console.error('Error chatting with library:', error);
      if (!res.headersSent) {
        if (error instanceof RateLimitError) {
          res
            .status(429)
            .json({ error: 'Rate limit exceeded. Please try again later.' });
        } else {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    }
  }

  @Get()
  async getAllPdfs() {
    const pdfs = await this.pdfService.getAllPdfs();
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

  @Post('create-folder')
  async createFolder(@Body('name') name: string, @Res() res: Response) {
    try {
      const folder = await this.pdfService.createFolder(name);
      res.status(201).json(folder);
    } catch (error) {
      console.error('Error creating folder:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  @Get(':id')
  async getPdfById(@Req() req: Request, @Res() res: Response) {
    const pdfId = req.params.id;
    try {
      const pdfDocument = await this.pdfService.getPdfById(pdfId);
      res.status(200).json(pdfDocument);
    } catch (error) {
      this.logger.error(
        `Error retrieving PDF by id ${pdfId}: ${error.message}`,
      );
      if (error instanceof NotFoundException) {
        res.status(404).json({ error: 'PDF not found' });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  @Post('folder-chat')
  async chatWithFolder(
    @Body('question') question: string,
    @Body('folderId') folderId: string,
    @Res() res: Response,
  ) {
    if (!question || !folderId) {
      return res
        .status(400)
        .json({ error: 'Question and Folder ID are required' });
    }
    try {
      await this.pdfService.chatWithFolder(question, folderId, res);
      // The response is handled within the service method, so we don't need to do anything here
    } catch (error) {
      console.error('Error chatting with folder:', error);
      if (!res.headersSent) {
        if (error instanceof RateLimitError) {
          res
            .status(429)
            .json({ error: 'Rate limit exceeded. Please try again later.' });
        } else {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    }
  }
}
