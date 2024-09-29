import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Res,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService } from '../services/pdf.service';
import { Response } from 'express';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    await this.pdfService.extractText(file.buffer);

    // Reset the conversation when a new PDF is uploaded
    this.pdfService.resetConversation();

    res.status(200).json({ message: 'PDF uploaded and text extracted.' });
  }

  @Post('chat')
  async chatWithPdf(@Body('question') question: string, @Res() res: Response) {
    if (!question) {
      throw new BadRequestException('Question is required');
    }
    await this.pdfService.chatWithPdfStream(question, res);
  }
}
