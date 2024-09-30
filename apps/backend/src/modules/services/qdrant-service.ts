import { QdrantClient } from '@qdrant/js-client-rest';

const qdrantClient = new QdrantClient({
  url: 'http://localhost:6333', // Update this if your Qdrant instance is hosted elsewhere
});

export const createCollection = async (collectionName: string) => {
  try {
    await qdrantClient.createCollection(collectionName, {
      vectors: {
        size: 128, // Example vector size, update as needed
        distance: 'Cosine',
      },
    });
    console.log(`Collection ${collectionName} created successfully.`);
  } catch (error) {
    console.error('Error creating collection:', error);
  }
};

export const upsertPoints = async (collectionName: string, points: any[]) => {
  try {
    await qdrantClient.upsert(collectionName, { points });
    console.log('Points upserted successfully.');
  } catch (error) {
    console.error('Error upserting points:', error);
  }
};

export const searchPoints = async (
  collectionName: string,
  vector: number[],
  limit: number = 10,
) => {
  try {
    const result = await qdrantClient.search(collectionName, {
      vector,
      limit,
    });
    return result;
  } catch (error) {
    console.error('Error searching points:', error);
  }
};
