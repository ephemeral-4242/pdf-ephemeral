import { Injectable } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { ConfigurationService } from 'src/config/configuration.service';

@Injectable()
export class QdrantService {
  private qdrantClient: QdrantClient;

  constructor(private configService: ConfigurationService) {
    this.qdrantClient = new QdrantClient({
      url: 'http://localhost:6333',
      apiKey: this.configService.get('QDRANT_API_KEY'),
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
          size: 384,
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

  async saveFolderPoints(
    collectionName: string,
    points: any[],
    folderId: string,
  ) {
    try {
      const pointsWithFolderId = points.map((point) => ({
        ...point,
        payload: {
          ...point.payload,
          folderId,
        },
      }));

      await this.qdrantClient.upsert(collectionName, {
        points: pointsWithFolderId,
      });
      console.log('Points upserted successfully with folderId.');
    } catch (error) {
      console.error('Error upserting points with folderId:', error);
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

  async searchPointsByFolderId(
    collectionName: string,
    vector: number[],
    folderId: string,
    limit: number = 10,
  ) {
    try {
      const filter = {
        must: [
          {
            key: 'folderId',
            match: {
              value: folderId,
            },
          },
        ],
      };

      const result = await this.qdrantClient.search(collectionName, {
        vector,
        limit,
        filter,
      });
      return result;
    } catch (error) {
      console.error('Error searching points by folderId:', error);
    }
  }
}
