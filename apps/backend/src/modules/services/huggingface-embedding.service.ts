import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { IEmbeddingService } from '../interface/embedding-service.interface';
import { HfInference } from '@huggingface/inference';

@Injectable()
export class HuggingFaceEmbeddingService
  implements IEmbeddingService, OnModuleInit
{
  private readonly logger = new Logger(HuggingFaceEmbeddingService.name);
  private hf: HfInference;
  private readonly model = 'sentence-transformers/all-MiniLM-L6-v2';

  constructor() {
    this.logger.log('Initializing HuggingFaceEmbeddingService');
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    this.logger.log('HuggingFace Inference initialized');
  }

  async onModuleInit() {
    this.logger.log('Warming up HuggingFace embedding model');
    try {
      // Warm up the model
      await this.generateEmbedding('Warm up text');
      this.logger.log('HuggingFace embedding model warmed up successfully');
    } catch (error) {
      this.logger.error(
        'Failed to warm up HuggingFace embedding model',
        error.stack,
      );
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    this.logger.debug(
      `Generating embedding for text: ${text.substring(0, 50)}...`,
    );
    try {
      const result = await this.hf.featureExtraction({
        model: this.model,
        inputs: text,
      });
      this.logger.debug('Embedding generated successfully');

      if (
        Array.isArray(result) &&
        result.every((item) => typeof item === 'number')
      ) {
        this.logger.debug('Returning result as number[]');
        return result as number[];
      } else if (
        Array.isArray(result) &&
        result.length === 1 &&
        Array.isArray(result[0])
      ) {
        this.logger.debug('Returning first element of result as number[]');
        return result[0] as number[];
      } else if (typeof result === 'number') {
        this.logger.debug('Returning single number result as array');
        return [result];
      } else {
        this.logger.error(
          'Unexpected response format from Hugging Face API',
          result,
        );
        throw new Error('Unexpected response format from Hugging Face API');
      }
    } catch (error) {
      this.logger.error('Error generating embedding:', error.stack);
      throw new Error('Failed to generate embedding');
    }
  }
}
