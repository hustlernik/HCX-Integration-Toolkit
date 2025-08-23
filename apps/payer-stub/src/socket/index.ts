import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer;

/**
 * Initialize the Socket.IO server.
 * @param httpServer - The HTTP server instance
 */
export const initSocket = (httpServer: HttpServer): void => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: 'http://localhost:8081',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 WebSocket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`WebSocket disconnected: ${socket.id}`);
    });
  });
};

/**
 * Emit an event to all connected WebSocket clients.
 * @param event - Event name
 * @param payload - Data payload
 */
export const sendToWebSocket = (event: string, payload: any): void => {
  if (io) {
    io.emit(event, payload);
  }
};
