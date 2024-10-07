import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { Response } from 'express';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { AIService } from '../interface/ai-service.interface';
import { PDFDocument } from 'src/types/pdf-document.type';
import { ChunkStreamingService } from './chunk-streaming.service';
import { ConfigurationService } from 'src/config/configuration.service';

@Injectable()
export class HuggingFaceService implements AIService {
  private readonly logger = new Logger(HuggingFaceService.name);
  private openai: OpenAI;

  constructor(
    private chunkStreamingService: ChunkStreamingService,
    private configService: ConfigurationService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('HUGGINGFACE_API_KEY'),
      baseURL: this.configService.get('HUGGINGFACE_INFERENCE_ENDPOINT'),
    });
  }

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

      const stream = await this.openai.chat.completions.create({
        model: this.configService.get('HUGGINGFACE_MODEL_IN_USE'),
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
