import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { Response } from 'express';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { AIService } from '../interface/ai-service.interface';
import { PDFDocument } from 'src/types/pdf-document.type';

@Injectable()
export class OpenAIService implements AIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async createChatCompletionStream(
    messages: ChatCompletionMessageParam[],
    res: Response,
    pdfDocuments?: PDFDocument[], // Change parameter to an array of PDFDocument objects
  ): Promise<string> {
    try {
      // Set headers for Server-Sent Events (SSE)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      // Stream the PDF documents' details and content

      // Create a streaming chat completion request
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4',
        stream: true,
        messages: messages,
      });

      let assistantReply = '';
      pdfDocuments.forEach((doc) => {
        const detail = JSON.stringify({
          name: doc.fileName,
          path: doc.filePath,
          id: doc.id,
        });
        res.write(`data: pdf-detail: ${detail}\n\n`);
      });
      // Iterate over the stream to get parts of the response
      for await (const part of stream) {
        const content = part.choices[0].delta?.content || '';
        assistantReply += content;
        // Write each part of the response to the client with a prefix
        res.write(`data: ai-content:${content}\n\n`);
      }

      // End the response when the stream is complete
      res.end();

      return assistantReply;
    } catch (error) {
      this.logger.error(`Error during streaming: ${error.message}`);
      res.status(500).end('Internal Server Error');
      throw error;
    }
  }
}
