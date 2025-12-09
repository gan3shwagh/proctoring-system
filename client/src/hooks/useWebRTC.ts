import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Get signaling server URL from environment or use default
const SIGNALING_SERVER_URL = import.meta.env.VITE_SIGNALING_URL || 
    (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000');

interface UseWebRTCProps {
    roomId: string;
    userId: string;
    isBroadcaster: boolean; // true for Student, false for Instructor
    localStream?: MediaStream | null; // For broadcaster
}

export const useWebRTC = ({ roomId, userId, isBroadcaster, localStream }: UseWebRTCProps) => {
    const socketRef = useRef<Socket | null>(null);
    const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
    const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});

    useEffect(() => {
        // Initialize Socket
        socketRef.current = io(SIGNALING_SERVER_URL);

        socketRef.current.on('connect', () => {
            console.log('Connected to signaling server');
            socketRef.current?.emit('join-room', roomId, userId);
        });

        // Handle new user joining (Instructor initiates connection to Student)
        socketRef.current.on('user-connected', async (newUserId: string) => {
            console.log('User connected:', newUserId);
            if (!isBroadcaster) {
                // Instructor initiates connection to the new student
                createPeerConnection(newUserId);
            }
        });

        // Handle Offer
        socketRef.current.on('offer', async (payload: { caller: string; sdp: any }) => {
            if (isBroadcaster) {
                // Student receives offer from Instructor
                const pc = createPeerConnection(payload.caller);
                await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socketRef.current?.emit('answer', {
                    target: payload.caller,
                    caller: userId,
                    sdp: answer
                });
            }
        });

        // Handle Answer
        socketRef.current.on('answer', async (payload: { caller: string; sdp: any }) => {
            const pc = peerConnections.current[payload.caller];
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            }
        });

        // Handle ICE Candidate
        socketRef.current.on('ice-candidate', async (payload: { caller: string; candidate: any }) => {
            const pc = peerConnections.current[payload.caller];
            if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            }
        });

        return () => {
            socketRef.current?.disconnect();
            Object.values(peerConnections.current).forEach(pc => pc.close());
        };
    }, [roomId, userId, isBroadcaster]);

    // Add local stream tracks to all peer connections (for Broadcaster)
    useEffect(() => {
        if (isBroadcaster && localStream) {
            Object.values(peerConnections.current).forEach(pc => {
                localStream.getTracks().forEach(track => {
                    // Check if track already exists
                    const senders = pc.getSenders();
                    const sender = senders.find(s => s.track?.kind === track.kind);
                    if (sender) {
                        sender.replaceTrack(track);
                    } else {
                        pc.addTrack(track, localStream);
                    }
                });
            });
        }
    }, [localStream, isBroadcaster]);

    const createPeerConnection = (targetUserId: string) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }, // Public STUN server
            ]
        });

        peerConnections.current[targetUserId] = pc;

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current?.emit('ice-candidate', {
                    target: targetUserId,
                    candidate: event.candidate
                });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStreams(prev => ({
                ...prev,
                [targetUserId]: event.streams[0]
            }));
        };

        // If Instructor, create offer
        if (!isBroadcaster) {
            pc.createOffer().then(offer => {
                pc.setLocalDescription(offer);
                socketRef.current?.emit('offer', {
                    target: targetUserId,
                    caller: userId,
                    sdp: offer
                });
            });
        }

        // If Broadcaster, add tracks immediately if available
        if (isBroadcaster && localStream) {
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });
        }

        return pc;
    };

    return { remoteStreams };
};
