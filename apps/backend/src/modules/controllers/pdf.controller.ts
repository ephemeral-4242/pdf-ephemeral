import {
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
    await this.pdfService.extractText(file.buffer);
    const analysis = await this.pdfService.analyzeContract();

    return {
      message: 'PDF uploaded and analyzed successfully',
      analysis,
    };
  }
}
