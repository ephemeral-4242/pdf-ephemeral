import { Injectable, Logger } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import OpenAI from 'openai';
import { Response } from 'express';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private pdfText: string;

  // New: Store the conversation messages
  private conversation: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }> = [];

  async extractText(buffer: Buffer): Promise<string> {
    try {
      const data = await pdf(buffer);
      this.pdfText = data.text;
      return this.pdfText;
    } catch (error) {
      this.logger.error(`Error extracting PDF text: ${error.message}`);
      throw error;
    }
  }

  // New: Reset conversation when a new PDF is uploaded
  resetConversation() {
    this.conversation = [
      {
        role: 'system',
        content:
          'You are an AI assistant that answers questions based on the provided PDF content.',
      },
      {
        role: 'user',
        content: `Here is the content of the PDF document:\n\n${this.pdfText}`,
      },
    ];
  }

  async chatWithPdfStream(question: string, res: Response): Promise<void> {
    try {
      // Add user's question to the conversation
      this.conversation.push({ role: 'user', content: question });

      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4',
        stream: true,
        messages: this.conversation,
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      let assistantReply = '';

      for await (const part of stream) {
        const content = part.choices[0].delta?.content || '';
        assistantReply += content;
        res.write(content);
      }

      res.end();

      // Add assistant's reply to the conversation
      this.conversation.push({ role: 'assistant', content: assistantReply });
    } catch (error) {
      this.logger.error(`Error during streaming: ${error.message}`);
      res.status(500).end('Internal Server Error');
    }
  }
}
