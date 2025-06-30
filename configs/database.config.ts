import dotenv from 'dotenv';
dotenv.config();

const isDev = process.env.NODE_ENV !== 'production';

const dbConfig = {
  url: isDev ? process.env.MONGO_URL_DEV || '' : process.env.MONGO_URL_PROD || '',

  dbName: process.env.MONGO_DB_NAME || (isDev ? 'hcx-toolkit' : 'hcx-toolkit-prod'),

  options: isDev ? { authSource: 'admin' } : { w: 'majority' as const },
};

if (!dbConfig.url) {
  throw new Error(`Database URL required. Set MONGO_URL_${isDev ? 'DEV' : 'PROD'}`);
}

export default dbConfig;
