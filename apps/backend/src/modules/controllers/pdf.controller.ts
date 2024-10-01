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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
      name: pdf.id, // Using id as name for now
      uploadDate: pdf.uploadDate,
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
}
