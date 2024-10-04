import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { AIService } from '../interface/ai-service.interface';
import { PDFDocument } from 'src/types/pdf-document.type';
import { ChunkStreamingService } from './chunk-streaming.service';
import axios from 'axios';

@Injectable()
export class HuggingFaceService implements AIService {
  private readonly logger = new Logger(HuggingFaceService.name);
  private readonly INFERENCE_ENDPOINT =
    process.env.HUGGINGFACE_INFERENCE_ENDPOINT;
  private readonly API_KEY = process.env.HUGGINGFACE_API_KEY;
  private readonly MAX_NEW_TOKENS = 1000;

  constructor(private chunkStreamingService: ChunkStreamingService) {}

  async createChatCompletionStream(
    messages: ChatCompletionMessageParam[],
    res: Response,
    pdfDocuments?: PDFDocument[],
  ): Promise<string> {
    try {
      this.chunkStreamingService.initializeStream(res);

      if (pdfDocuments) {
        this.chunkStreamingService.streamPdfDetails(res, pdfDocuments);
      }

      const prompt = this.formatMessages(messages);
      const response = await axios.post(
        this.INFERENCE_ENDPOINT,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: this.MAX_NEW_TOKENS,
            temperature: 0.7,
            top_p: 0.95,
            repetition_penalty: 1.2,
            stream: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        },
      );

      let assistantReply = '';
      response.data.on('data', (chunk: Buffer) => {
        const lines = chunk
          .toString()
          .split('\n')
          .filter((line) => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = JSON.parse(line.slice(5));
            if (data.token && data.token.text) {
              assistantReply += data.token.text;
              this.chunkStreamingService.streamAIContent(res, data.token.text);
            }
          }
        }
      });

      await new Promise((resolve) => response.data.on('end', resolve));

      this.chunkStreamingService.endStream(res);

      return assistantReply;
    } catch (error) {
      this.logger.error(`Error during streaming: ${error.message}`);
      this.chunkStreamingService.streamError(res, 'Internal Server Error');
      throw error;
    }
  }

  private formatMessages(messages: ChatCompletionMessageParam[]): string {
    let formattedPrompt = '';
    for (const message of messages) {
      if (message.role === 'system') {
        formattedPrompt += `[INST] <<SYS>>\n${message.content}\n<</SYS>>\n\n`;
      } else if (message.role === 'user') {
        formattedPrompt += `[INST] ${message.content} [/INST]\n`;
      } else if (message.role === 'assistant') {
        formattedPrompt += `${message.content}\n`;
      }
    }
    return formattedPrompt;
  }
}
