import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    socket = io(socketUrl, {
      autoConnect: true,
      withCredentials: true,
    });

    socket.on('connect', () => console.log('[Socket.IO Client]: Connected ->', socket.id));
    socket.on('disconnect', () => console.log('[Socket.IO Client]: Disconnected'));
  }
  return socket;
};
