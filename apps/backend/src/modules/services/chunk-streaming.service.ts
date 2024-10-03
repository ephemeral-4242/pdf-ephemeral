import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { PDFDocument } from 'src/types/pdf-document.type';

@Injectable()
export class ChunkStreamingService {
  private readonly logger = new Logger(ChunkStreamingService.name);

  streamPdfDetails(res: Response, pdfDocuments: PDFDocument[]): void {
    pdfDocuments.forEach((doc) => {
      const detail = JSON.stringify({
        type: 'pdf-detail',
        name: doc.fileName,
        path: doc.filePath,
        id: doc.id,
      });
      res.write(`data: ${detail}\n\n`);
    });
  }

  streamAIContent(res: Response, content: string): void {
    const chunk = JSON.stringify({
      type: 'ai-content',
      content: content,
    });
    res.write(`data: ${chunk}\n\n`);
  }

  streamError(res: Response, error: string): void {
    const errorData = JSON.stringify({
      type: 'error',
      message: error,
    });
    res.write(`data: ${errorData}\n\n`);
  }

  initializeStream(res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
  }

  endStream(res: Response): void {
    res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
    res.end();
  }
}
