import { Server } from 'socket.io';

let io: Server | null = null;

export function initSocket(server: any) {
  const allowedOrigins = ['http://localhost:8081', 'http://127.0.0.1:8081', 'http://[::1]:8081'];
  const corsOrigin = (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by Socket.IO CORS`));
  };

  io = new Server(server, {
    cors: {
      origin: corsOrigin as any,
      methods: ['GET', 'POST'],
      credentials: false,
    },
  });
  io.on('connection', (socket) => {
    console.log('WebSocket client connected:', socket.id, 'from', socket.handshake.headers.origin);
    socket.on('disconnect', (reason) => {
      console.log('WebSocket client disconnected:', socket.id, 'reason:', reason);
    });
    socket.on('error', (err) => {
      console.error('WebSocket client error:', socket.id, err);
    });
  });
}

export function sendToWebSocket(event: string, data: any) {
  if (io) {
    console.log('Emitting socket event:', event, { keys: Object.keys(data ?? {}) });
    io.emit(event, data);
  }
}
