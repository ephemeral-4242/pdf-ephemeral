import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService } from '../services/pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(@UploadedFile() file: Express.Multer.File) {
    const text = await this.pdfService.extractText(file.buffer);
    return {
      message: 'PDF uploaded and processed successfully',
      textLength: text.length,
    };
  }

  @Post('chat')
  async chatWithPdf(@Body() body: { question: string }) {
    return this.pdfService.generateResponse(body.question);
  }
}
