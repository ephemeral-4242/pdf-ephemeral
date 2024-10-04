import { Injectable, OnModuleInit } from '@nestjs/common';
import { IEmbeddingService } from '../interface/embedding-service.interface';
import { HfInference } from '@huggingface/inference';

@Injectable()
export class HuggingFaceEmbeddingService
  implements IEmbeddingService, OnModuleInit
{
  private hf: HfInference;
  private readonly model = 'sentence-transformers/all-MiniLM-L6-v2';

  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }

  async onModuleInit() {
    // Warm up the model
    await this.generateEmbedding('Warm up text');
    console.log('HuggingFace embedding model warmed up');
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.hf.featureExtraction({
        model: this.model,
        inputs: text,
      });

      if (
        Array.isArray(result) &&
        result.every((item) => typeof item === 'number')
      ) {
        return result as number[];
      } else if (
        Array.isArray(result) &&
        result.length === 1 &&
        Array.isArray(result[0])
      ) {
        return result[0] as number[];
      } else if (typeof result === 'number') {
        return [result];
      } else {
        throw new Error('Unexpected response format from Hugging Face API');
      }
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }
}
