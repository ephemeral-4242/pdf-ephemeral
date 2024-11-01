import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

async function createDatabase() {
  // Parse database URL from environment
  const url = new URL(process.env.DATABASE_URL);
  const database = url.pathname.slice(1);

  // Create connection to postgres without database selected
  const connectionString = `postgresql://${url.username}:${url.password}@${url.hostname}:${url.port}/postgres`;

  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    // Check if database exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname='${database}'`,
    );

    if (result.rowCount === 0) {
      // Create database if it doesn't exist
      await client.query(`CREATE DATABASE ${database}`);
      console.log(`Database ${database} created successfully`);
    } else {
      console.log(`Database ${database} already exists`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

createDatabase()
  .then(() => {
    // Run migrations after database is created
    execSync('bunx prisma migrate dev', { stdio: 'inherit' });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
