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
        {
          role: 'system',
          content: 'You are a real estate contract analysis assistant.',
        },
        {
          role: 'user',
          content: `Please analyze the following real estate contract. Extract key information such as property details, parties involved, financial terms, dates, contingencies, and any potential risks or unusual clauses. Provide the analysis in bullet points:\n\n${text}`,
        },
      ],
      max_tokens: 1500,
    });

    return response.choices[0].message.content;
  }
}
