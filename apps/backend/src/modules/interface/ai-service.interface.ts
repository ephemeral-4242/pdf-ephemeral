import { Response } from 'express';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export const AI_SERVICE = Symbol('AIService');

export interface AIService {
  createChatCompletionStream(
    messages: ChatCompletionMessageParam[],
    res: Response,
  ): Promise<string>;
}
