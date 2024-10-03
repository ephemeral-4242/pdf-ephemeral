import { Response } from 'express';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { PDFDocument } from 'src/types/pdf-document.type';

export const AI_SERVICE = Symbol('AIService');

export interface AIService {
  createChatCompletionStream(
    messages: ChatCompletionMessageParam[],
    res: Response,
    pdfDocuments?: PDFDocument[],
  ): Promise<string>;
}
