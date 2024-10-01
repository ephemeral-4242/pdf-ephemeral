import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class EmbeddingService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        console.log('Generating embedding for text:', text.slice(0, 100));

        const response = await this.openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: text,
        });
        console.log('Embedding generated successfully', response);
        return response.data[0].embedding;
      } catch (error) {
        if (error.response && error.response.status === 429) {
          console.error(
            `Error generating embedding: ${error.message}. Retrying... (${retries + 1}/${maxRetries})`,
          );
          retries += 1;
          const backoffTime = Math.pow(2, retries) * 1000;
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        } else {
          console.error(`Error generating embedding: ${error.message}`);
          throw error;
        }
      }
    }

    throw new Error('Exceeded maximum retries for generating embedding');
  }
}
