import { Server } from 'socket.io';

let io: Server | null = null;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:8081',
      methods: ['GET', 'POST'],
    },
  });
  io.on('connection', (socket) => {
    console.log('WebSocket client connected');
  });
}

export function sendToWebSocket(event: string, data: any) {
  if (io) {
    console.log('Emitting socket event:', event, data);
    io.emit(event, data);
  }
}
