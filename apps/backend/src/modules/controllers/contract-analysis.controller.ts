import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContractAnalysisService } from '../services/contract-analysis.service';
import { Response } from 'express';

@Controller('contract-analysis')
export class ContractAnalysisController {
  constructor(
    private readonly contractAnalysisService: ContractAnalysisService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadContract(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    let text: string;
    if (file.mimetype === 'application/pdf') {
      text = await this.contractAnalysisService.extractTextFromPdf(file.buffer);
    } else if (
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      text = await this.contractAnalysisService.extractTextFromDocx(
        file.buffer,
      );
    } else {
      throw new Error('Unsupported file type');
    }

    const analysis = await this.contractAnalysisService.analyzeContract(text);
    res.json({ analysis });
  }
}
