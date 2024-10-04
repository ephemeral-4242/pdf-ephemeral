import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { Response } from 'express';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { AIService } from '../interface/ai-service.interface';
import { PDFDocument } from 'src/types/pdf-document.type';
import { ChunkStreamingService } from './chunk-streaming.service';

@Injectable()
export class HuggingFaceService implements AIService {
  private readonly logger = new Logger(HuggingFaceService.name);

  // Update the baseURL to Hugging Face’s endpoint
  private openai = new OpenAI({
    apiKey: process.env.HUGGINGFACE_API_KEY,
    baseURL: process.env.HUGGINGFACE_INFERENCE_ENDPOINT,
  });

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

      // Update the model name to "meta-llama/Llama-3.1-70B-Instruct"
      const stream = await this.openai.chat.completions.create({
        model: 'meta-llama/Llama-3.1-70B-Instruct',
        stream: true,
        messages: messages,
      });

      let assistantReply = '';
      for await (const part of stream) {
        const content = part.choices[0].delta?.content || '';
        assistantReply += content;
        this.chunkStreamingService.streamAIContent(res, content);
      }

      this.chunkStreamingService.endStream(res);

      return assistantReply;
    } catch (error) {
      this.logger.error(`Error during streaming: ${error.message}`);
      this.chunkStreamingService.streamError(res, 'Internal Server Error');
      throw error;
    }
  }
}
