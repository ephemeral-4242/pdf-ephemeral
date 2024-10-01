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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService } from '../services/pdf.service';
import { Request, Response } from 'express';
import { RateLimitError } from 'openai';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body('folderName') folderName: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const pdfDocument = await this.pdfService.processAndSavePdf(
      file,
      folderName,
    );

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${pdfDocument.id}`;

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
}
