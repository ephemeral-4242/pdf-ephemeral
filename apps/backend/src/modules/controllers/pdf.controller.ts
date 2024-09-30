import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Res,
  Body,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService } from '../services/pdf.service';
import { Request, Response } from 'express';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const pdfDocument = await this.pdfService.processAndSavePdf(file);

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${pdfDocument.id}`;

    res.status(200).json({
      message: 'PDF uploaded and text extracted.',
      url: fileUrl,
    });
  }

  @Post('chat')
  async chatWithPdf(@Body('question') question: string, @Res() res: Response) {
    if (!question) {
      throw new BadRequestException('Question is required');
    }
    await this.pdfService.chatWithPdfStream(question, res);
  }
}
