import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    // On Vercel (serverless), Socket.IO persistent connections are not supported.
    // Use the same origin so the browser connects to the correct host.
    // In production this resolves to the Vercel deployment URL.
    // In local dev it resolves to localhost:5000 via Vite proxy.
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

    socket = io(socketUrl, {
      autoConnect: true,
      withCredentials: true,
      transports: ['polling'], // Use polling as fallback since Vercel doesn't support WebSocket upgrades
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    socket.on('connect', () => console.log('[Socket.IO Client]: Connected ->', socket.id));
    socket.on('disconnect', () => console.log('[Socket.IO Client]: Disconnected'));
    socket.on('connect_error', (err) => {
      // Silently fail — Socket.IO features (live notifications) won't work on serverless
      // but core app functionality (code submission, login, problems) still works fine
      console.warn('[Socket.IO]: Could not connect (serverless env). Real-time features disabled.', err.message);
    });
  }
  return socket;
};
