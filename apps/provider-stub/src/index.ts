import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import nhcxRoutes from './routes/nhcx.routes';
import sessionRouter from './routes/session.routes';
import { encryptFHIR } from '../src/utils/crypto';
import http from 'http';
import { initSocket } from './socket/index';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

const mongoUrl = process.env.MONGO_URL_DEV || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'hcx-toolkit';

mongoose
  .connect(`${mongoUrl}/${dbName}`)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/', nhcxRoutes);
app.use('/', sessionRouter);

app.get('/', (req, res) => {
  res.send('Provider Stub API');
});

app.get('/socket-health', (req, res) => {
  res.json({
    status: 'healthy',
    socket: 'available',
    timestamp: Math.floor(Date.now() / 1000).toString(),
  });
});

app.post('/encrypt', async (req, res) => {
  try {
    const { payload, protocolHeaders = {}, domainHeaders = {} } = req.body;
    const jwe = await encryptFHIR(payload, protocolHeaders, domainHeaders);
    res.json({ jwe });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

const server = http.createServer(app);
initSocket(server);
const PORT = Number(process.env.PROVIDER_PORT || process.env.PORT || 4001);
server.listen(PORT, () => {
  console.log(`Provider-stub listening on port ${PORT}`);
});
