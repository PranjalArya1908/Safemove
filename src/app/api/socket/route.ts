import { Server, Socket } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';

let io: Server | undefined;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!io) {
    const httpServer = (res as any).socket.server;
    io = new Server(httpServer, {
      path: '/api/socket',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket: Socket) => {
      console.log('New client connected:', socket.id);

      socket.on('joinSession', (sessionId: string) => {
        socket.join(sessionId);
        socket.emit('sessionJoined', { success: true, message: `Joined session ${sessionId}` });
      });

      socket.on('locationUpdate', ({ sessionId, latitude, longitude }: { sessionId: string; latitude: number; longitude: number }) => {
        io?.to(sessionId).emit('locationUpdate', { latitude, longitude });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  res.status(200).end();
}
