import dotenv from 'dotenv';
dotenv.config();

interface DbOptions {
  authSource?: string;
  w?: 'majority';
  [key: string]: any;
}

interface DbConfig {
  url: string;
  dbName: string;
  options: DbOptions;
}

const isDev: boolean = process.env.NODE_ENV !== 'production';

const dbConfig: DbConfig = {
  url: isDev ? process.env.MONGO_URL_DEV || '' : process.env.MONGO_URL_PROD || '',

  dbName: process.env.MONGO_DB_NAME || (isDev ? 'hcx-toolkit' : 'hcx-toolkit-prod'),

  options: isDev ? { authSource: 'admin' } : { w: 'majority' as const },
};

if (!dbConfig.url) {
  throw new Error(`Database URL required. Set MONGO_URL_${isDev ? 'DEV' : 'PROD'}`);
}

export default dbConfig;
