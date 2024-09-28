import { Injectable, Logger } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import OpenAI from 'openai';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private pdfText: string;

  async extractText(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer);
    this.pdfText = data.text;
    return this.pdfText;
  }

  async analyzeContract(): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an AI assistant that analyzes contracts. Always respond in valid JSON format.',
          },
          {
            role: 'user',
            content: `Analyze the following contract and provide:
            1. A summary of the main points (max 3 sentences)
            2. Key data points (parties, dates, monetary values)
            3. Potential risks or unclear clauses
            4. Suggestions for improvement

            Respond in JSON format.

            Contract text: ${this.pdfText}`,
          },
        ],
      });

      const content = response.choices[0].message.content;

      // Log the raw response for debugging
      this.logger.debug(`Raw OpenAI response: ${content}`);

      // Attempt to parse the JSON, if it fails, return the raw content
      try {
        return JSON.parse(content);
      } catch (parseError) {
        this.logger.warn(
          `Failed to parse OpenAI response as JSON: ${parseError.message}`,
        );
        return { rawResponse: content };
      }
    } catch (error) {
      this.logger.error(`Error analyzing contract: ${error.message}`);
      throw error;
    }
  }
}
