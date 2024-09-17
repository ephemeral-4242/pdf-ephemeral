import { Injectable } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import * as docx from 'docx-parser';
import OpenAI from 'openai';

@Injectable()
export class ContractAnalysisService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer);
    return data.text;
  }

  async extractTextFromDocx(buffer: Buffer): Promise<string> {
    const text = await docx.parse(buffer);
    return text;
  }

  async analyzeContract(text: string): Promise<any> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a contract analysis assistant.' },
        {
          role: 'user',
          content: `Analyze the following contract and identify key terms, clauses, and potential risks:\n\n${text}`,
        },
      ],
      max_tokens: 1500,
    });

    return response.choices[0].message.content;
  }
}
