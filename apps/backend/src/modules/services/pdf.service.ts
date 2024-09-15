import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { PDFExtract } from 'pdf.js-extract';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private openai: OpenAI;
  private pdfText: string = '';
  private pdfExtract: PDFExtract;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.pdfExtract = new PDFExtract();
  }

  async extractText(pdfBuffer: Buffer): Promise<string> {
    try {
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Empty PDF buffer received');
      }

      const data = await this.pdfExtract.extractBuffer(pdfBuffer);

      if (!data || !data.pages || data.pages.length === 0) {
        throw new Error('No pages found in the PDF');
      }

      this.pdfText = data.pages
        .map((page) => page.content.map((item) => item.str).join(' '))
        .join('\n')
        .trim();

      if (this.pdfText.length === 0) {
        throw new Error('Extracted text is empty after processing');
      }

      this.logger.log(
        `Successfully extracted text from PDF. Length: ${this.pdfText.length} characters`,
      );
      return this.pdfText;
    } catch (error) {
      this.logger.error(
        `Error extracting text from PDF: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  async generateResponse(question: string): Promise<string> {
    try {
      if (!this.pdfText) {
        throw new Error(
          'No PDF text available. Please extract text from a PDF first.',
        );
      }

      const maxLength = 4000;
      const truncatedPdfText =
        this.pdfText.length > maxLength
          ? this.pdfText.slice(0, maxLength) + '...'
          : this.pdfText;

      this.logger.debug(
        `Truncated PDF text length: ${truncatedPdfText.length} characters`,
      );

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that answers questions based on the content of a PDF. The PDF content will be provided in the next message.',
          },
          { role: 'user', content: `PDF content: ${truncatedPdfText}` },
          { role: 'user', content: `Question: ${question}` },
        ],
      });

      if (!response.choices[0].message.content) {
        throw new Error('No response content received from OpenAI');
      }

      console.log(
        'response.choices[0].message : ',
        response.choices[0].message,
      );

      this.logger.debug('Response generated successfully');
      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error(
        `Error generating response: ${error.message}`,
        error.stack,
      );
      return 'An error occurred while generating the response.';
    }
  }
}
