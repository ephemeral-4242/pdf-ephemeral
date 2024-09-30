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
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Specify the uploads folder
        filename: (req, file, cb) => {
          // Generate a unique filename
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Req() req: Request, // Inject the request object
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Read the file from disk
    const filePath = path.resolve(file.path);
    const fileBuffer = fs.readFileSync(filePath);

    await this.pdfService.extractText(fileBuffer);

    // Reset the conversation when a new PDF is uploaded
    this.pdfService.resetConversation();

    // Build the file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

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
