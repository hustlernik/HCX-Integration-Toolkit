import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import app from './app';
import { initSocket } from './socket/index';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const server = http.createServer(app);

initSocket(server);

app.get('/', (req, res) => {
  res.send('Payer Stub API');
});

const PORT = Number(process.env.PORT) || 3001;

server.listen(PORT, () => {
  console.log(`Payer Stub Server is running at http://localhost:${PORT}`);
});
