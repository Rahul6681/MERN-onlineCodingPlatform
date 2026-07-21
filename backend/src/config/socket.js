const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO]: Client connected -> ${socket.id}`);

    socket.on('contest:join', (contestId) => {
      socket.join(`contest_${contestId}`);
      console.log(`[Socket.IO]: Socket ${socket.id} joined contest_${contestId}`);
    });

    socket.on('user:join', (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO]: Client disconnected -> ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    // Return dummy io logger if called before init or in test mode
    return {
      to: () => ({ emit: () => {} }),
      emit: () => {},
    };
  }
  return io;
};

module.exports = { initSocket, getIO };
