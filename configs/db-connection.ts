import process from 'process';

import { MongoClient, Db } from 'mongodb';
import dbConfig from './database.config';

const client = new MongoClient(dbConfig.url, dbConfig.options);

let dbConnection: MongoClient | null = null;

export const connectToDatabase = async (): Promise<MongoClient> => {
  if (dbConnection) {
    return dbConnection;
  }

  try {
    dbConnection = await client.connect();
    console.log('Successfully connected to MongoDB.');
    return dbConnection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error(`Database connection failed: ${error}`);
  }
};

export const getDb = (): Db => {
  if (!dbConnection) {
    throw new Error('Must connect to database first.');
  }
  return dbConnection.db(dbConfig.dbName);
};

export const closeConnection = async (): Promise<void> => {
  if (dbConnection) {
    await dbConnection.close();
    dbConnection = null;
    console.log('Database connection closed.');
  }
};

const gracefulShutdown = () => {
  closeConnection().catch((error) => {
    console.error('Error during graceful shutdown:', error);
  });
};

if (typeof process !== 'undefined') {
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}
