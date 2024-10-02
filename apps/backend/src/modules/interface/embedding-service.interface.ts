export interface IEmbeddingService {
  generateEmbedding(text: string): Promise<number[]>;
}

export const EMBEDDING_SERVICE = 'EMBEDDING_SERVICE';
