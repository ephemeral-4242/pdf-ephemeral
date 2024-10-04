import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { AIService } from '../interface/ai-service.interface';
import { PDFDocument } from 'src/types/pdf-document.type';
import { ChunkStreamingService } from './chunk-streaming.service';
import axios from 'axios';
import { Readable } from 'stream';

@Injectable()
export class HuggingFaceService implements AIService {
  private readonly logger = new Logger(HuggingFaceService.name);

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

      const maxTokens = this.calculateMaxTokens(messages);
      const response = await this.makeHuggingFaceApiCall(maxTokens);

      return this.handleStreamingResponse(response, res);
    } catch (error) {
      this.handleError(error, res);
      throw error;
    }
  }

  private calculateMaxTokens(messages: ChatCompletionMessageParam[]): number {
    const inputTokens = messages
      .map((msg) => msg.content)
      .join(' ')
      .split(' ').length;
    return Math.max(4096 - inputTokens, 0);
  }

  private async makeHuggingFaceApiCall(maxTokens: number) {
    return axios({
      method: 'post',
      url: `${process.env.HUGGINGFACE_INFERENCE_ENDPOINT}`,
      data: {
        inputs: 'hey',
        parameters: { max_new_tokens: maxTokens, return_full_text: false },
        options: { use_cache: true },
        stream: true,
      },
      headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
      responseType: 'stream',
    });
  }

  private handleStreamingResponse(
    response: any,
    res: Response,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let assistantReply = '';

      response.data.on('data', (chunk: Buffer) => {
        const content = chunk.toString();
        assistantReply += content;
        this.chunkStreamingService.streamAIContent(res, content);
      });

      response.data.on('end', () => {
        this.chunkStreamingService.endStream(res);
        resolve(assistantReply);
      });

      response.data.on('error', (error: Error) => {
        this.logger.error(`Error during streaming: ${error.message}`);
        this.chunkStreamingService.streamError(res, 'Internal Server Error');
        reject(error);
      });
    });
  }

  private handleError(error: any, res: Response) {
    this.logger.error(`Error during LLM call: ${error.message}`);
    this.chunkStreamingService.streamError(res, 'Internal Server Error');
  }
}
