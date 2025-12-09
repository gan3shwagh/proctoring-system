import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

export const initSocket = (httpServer: HttpServer) => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*", // Allow all origins for now
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        // Join a room (exam session)
        socket.on('join-room', (roomId: string, userId: string) => {
            socket.join(roomId);
            console.log(`User ${userId} joined room ${roomId}`);
            // Notify others in the room (e.g., instructor) that a user connected
            socket.to(roomId).emit('user-connected', userId);
        });

        // WebRTC Signaling: Offer
        socket.on('offer', (payload: { target: string; caller: string; sdp: any }) => {
            io.to(payload.target).emit('offer', payload);
        });

        // WebRTC Signaling: Answer
        socket.on('answer', (payload: { target: string; caller: string; sdp: any }) => {
            io.to(payload.target).emit('answer', payload);
        });

        // WebRTC Signaling: ICE Candidate
        socket.on('ice-candidate', (payload: { target: string; candidate: any }) => {
            io.to(payload.target).emit('ice-candidate', payload);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};
