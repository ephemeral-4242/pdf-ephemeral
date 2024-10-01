import { QdrantClient } from '@qdrant/js-client-rest';

const qdrantClient = new QdrantClient({
  url: 'http://localhost:6333', // Update this if your Qdrant instance is hosted elsewhere
  apiKey: process.env.QDRANT_API_KEY, // Add this line if an API key is required
});

export const createCollection = async (collectionName: string) => {
  try {
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
      (collection) => collection.name === collectionName,
    );

    if (collectionExists) {
      console.log(
        `Collection ${collectionName} already exists. Skipping creation.`,
      );
      return;
    }

    await qdrantClient.createCollection(collectionName, {
      vectors: {
        size: 1536, // Ensure this matches the vector size being generated
        distance: 'Cosine',
      },
    });
    console.log(`Collection ${collectionName} created successfully.`);
  } catch (error) {
    console.error('Error creating collection:', error);
  }
};

export const deleteCollection = async (collectionName: string) => {
  try {
    await qdrantClient.deleteCollection(collectionName);
    console.log(`Collection ${collectionName} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting collection:', error);
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

export const queryQdrant = async (vector: number[]): Promise<string[]> => {
  try {
    const searchResults = await searchPoints('pdf_collection', vector);
    return searchResults.map((result: any) => result.payload.text);
  } catch (error) {
    console.error('Error querying Qdrant:', error);
    throw new Error('Failed to query Qdrant');
  }
};
