import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { Response } from 'express';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { AIService } from '../interface/ai-service.interface';

@Injectable()
export class OpenAIService implements AIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async createChatCompletionStream(
    messages: ChatCompletionMessageParam[],
    res: Response,
  ): Promise<string> {
    try {
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4',
        stream: true,
        messages: messages,
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

      return assistantReply;
    } catch (error) {
      this.logger.error(`Error during streaming: ${error.message}`);
      res.status(500).end('Internal Server Error');
      throw error;
    }
  }
}
