import './loadEnv';
import http from 'http';
import app from './app';
import { initSocket } from './socket/index';

const server = http.createServer(app);

initSocket(server);

app.get('/', (req, res) => {
  res.send('Payer Stub API');
});

const PORT = Number(process.env.PORT) || 3001;

server.listen(PORT, () => {
  console.log(`Payer Stub Server is running at http://localhost:${PORT}`);
});
