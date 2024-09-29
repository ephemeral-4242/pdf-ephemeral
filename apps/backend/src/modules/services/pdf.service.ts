import { Injectable, Logger } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import OpenAI from 'openai';
import { Response } from 'express';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private pdfText: string;

  async extractText(buffer: Buffer): Promise<string> {
    try {
      const data = await pdf(buffer);
      this.pdfText = data.text;
      return this.pdfText;
    } catch (error) {
      this.logger.error(`Error extracting PDF text: ${error.message}`);
      // ... existing error handling ...
      throw error;
    }
  }

  async analyzeContractStream(res: Response): Promise<void> {
    try {
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4',
        stream: true,
        messages: [
          {
            role: 'system',
            content:
              'You are an AI assistant that analyzes contracts. Always respond in valid JSON format.',
          },
          {
            role: 'user',
            content: `Analyze the following contract and provide:
            1. A summary of the main points (max 3 sentences)
            2. Key data points (parties, dates, monetary values)
            3. Potential risks or unclear clauses
            4. Suggestions for improvement

            Respond in JSON format.

            Contract text: ${this.pdfText}`,
          },
        ],
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders(); // Flush the headers to establish SSE with the client

      for await (const part of stream) {
        const content = part.choices[0].delta?.content || '';
        res.write(content);
      }

      res.end();
    } catch (error) {
      this.logger.error(`Error during streaming: ${error.message}`);
      res.status(500).end('Internal Server Error');
    }
  }
}
