import { Injectable } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService {
  private qdrantClient: QdrantClient;

  constructor() {
    this.qdrantClient = new QdrantClient({
      url: 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY,
    });
  }

  async createCollection(collectionName: string) {
    try {
      const collections = await this.qdrantClient.getCollections();
      const collectionExists = collections.collections.some(
        (collection) => collection.name === collectionName,
      );

      if (collectionExists) {
        console.log(
          `Collection ${collectionName} already exists. Skipping creation.`,
        );
        return;
      }

      await this.qdrantClient.createCollection(collectionName, {
        vectors: {
          size: 1536,
          distance: 'Cosine',
        },
      });
      console.log(`Collection ${collectionName} created successfully.`);
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  }

  async deleteCollection(collectionName: string) {
    try {
      await this.qdrantClient.deleteCollection(collectionName);
      console.log(`Collection ${collectionName} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  }

  async upsertPoints(collectionName: string, points: any[]) {
    try {
      await this.qdrantClient.upsert(collectionName, { points });
      console.log('Points upserted successfully.');
    } catch (error) {
      console.error('Error upserting points:', error);
    }
  }

  async searchPoints(
    collectionName: string,
    vector: number[],
    limit: number = 10,
  ) {
    try {
      const result = await this.qdrantClient.search(collectionName, {
        vector,
        limit,
      });
      return result;
    } catch (error) {
      console.error('Error searching points:', error);
    }
  }

  async queryQdrant(vector: number[]): Promise<string[]> {
    try {
      const searchResults = await this.searchPoints('pdf_collection', vector);
      return searchResults.map((result: any) => result.payload.text);
    } catch (error) {
      console.error('Error querying Qdrant:', error);
      throw new Error('Failed to query Qdrant');
    }
  }
}
