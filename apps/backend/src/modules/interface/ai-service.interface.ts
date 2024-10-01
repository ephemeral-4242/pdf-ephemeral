import { Response } from 'express';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export interface AIService {
  createChatCompletionStream(
    messages: ChatCompletionMessageParam[],
    res: Response,
  ): Promise<string>;
}
