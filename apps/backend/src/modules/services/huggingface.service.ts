import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { AIService } from '../interface/ai-service.interface';
import { PDFDocument } from 'src/types/pdf-document.type';
import { ChunkStreamingService } from './chunk-streaming.service';
import { pipeline, AutoTokenizer } from '@huggingface/transformers';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

@Injectable()
export class HuggingFaceService implements AIService {
  private readonly logger = new Logger(HuggingFaceService.name);
  private generator: any;
  private tokenizer: any;

  constructor(private chunkStreamingService: ChunkStreamingService) {
    this.initializeGenerator();
  }

  private async initializeGenerator() {
    // Use a more advanced model
    const modelName = 'gpt2-large';
    this.generator = await pipeline('text-generation', modelName);
    this.tokenizer = await AutoTokenizer.from_pretrained(modelName);
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

      const inputText = this.formatMessages(messages);
      const encodedInput = await this.tokenizer.encode(inputText);

      if (encodedInput.length > 1024) {
        throw new Error('Input too long');
      }

      const stream = await this.generator(inputText, {
        max_length: 1024,
        num_return_sequences: 1,
        do_sample: true,
        temperature: 0.7,
        top_k: 50,
        top_p: 0.95,
        no_repeat_ngram_size: 2,
        streaming: true,
      });

      let assistantReply = '';
      for await (const output of stream) {
        const chunk = output.generated_text.slice(assistantReply.length);
        assistantReply += chunk;
        this.chunkStreamingService.streamAIContent(res, chunk);
      }

      this.chunkStreamingService.endStream(res);

      return assistantReply;
    } catch (error) {
      this.logger.error(`Error during streaming: ${error.message}`);
      this.chunkStreamingService.streamError(res, error.message);
      throw error;
    }
  }

  private formatMessages(messages: ChatCompletionMessageParam[]): string {
    return messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n');
  }
}
