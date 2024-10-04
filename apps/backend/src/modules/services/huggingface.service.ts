import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { AIService } from '../interface/ai-service.interface';
import { PDFDocument } from 'src/types/pdf-document.type';
import { ChunkStreamingService } from './chunk-streaming.service';
import { HfInference } from '@huggingface/inference';

@Injectable()
export class HuggingFaceService implements AIService {
  private readonly logger = new Logger(HuggingFaceService.name);
  private hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  private readonly MAX_TOKENS = 4096;
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
      const stream = await this.hf.textGenerationStream({
        model: 'meta-llama/Llama-2-70b-chat-hf',
        inputs: prompt,
        parameters: {
          max_new_tokens: this.MAX_NEW_TOKENS,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.2,
        },
      });

      let assistantReply = '';
      for await (const { token } of stream) {
        assistantReply += token.text;
        this.chunkStreamingService.streamAIContent(res, token.text);
      }

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
