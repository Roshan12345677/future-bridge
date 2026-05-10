/**
 * Socket.io Event Handler
 * Manages real-time chat, notifications, and live updates
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Online users map: userId -> socketId
  const onlineUsers = new Map();

  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('name avatar role');
        socket.user = user;
      }
      next();
    } catch (error) {
      next(); // Allow unauthenticated connections (limited features)
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} - User: ${socket.user?.name || 'Anonymous'}`);

    // Register user as online
    if (socket.user) {
      onlineUsers.set(socket.user._id.toString(), socket.id);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    }

    // Join a chat room
    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`👥 ${socket.user?.name || 'User'} joined room: ${room}`);
      socket.to(room).emit('userJoined', {
        user: socket.user,
        message: `${socket.user?.name || 'Someone'} joined the room`,
        timestamp: new Date(),
      });
    });

    // Leave a chat room
    socket.on('leaveRoom', (room) => {
      socket.leave(room);
      socket.to(room).emit('userLeft', {
        user: socket.user,
        message: `${socket.user?.name || 'Someone'} left the room`,
        timestamp: new Date(),
      });
    });

    // Send chat message (via socket - bypasses REST API)
    socket.on('sendMessage', async (data) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Authentication required to send messages' });
        return;
      }

      try {
        const { ChatMessage } = require('../models/index');
        const message = await ChatMessage.create({
          room: data.room || 'general',
          sender: socket.user._id,
          message: data.message,
          messageType: data.messageType || 'text',
          replyTo: data.replyTo,
        });

        await message.populate('sender', 'name avatar role');

        io.to(data.room || 'general').emit('newMessage', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(data.room).emit('userTyping', {
        user: socket.user?.name || 'Someone',
        isTyping: data.isTyping,
      });
    });

    // Live code sharing
    socket.on('codeUpdate', (data) => {
      socket.to(data.room).emit('codeChanged', {
        code: data.code,
        language: data.language,
        user: socket.user?.name,
      });
    });

    // Notification event
    socket.on('sendNotification', (data) => {
      if (data.targetUserId) {
        const targetSocketId = onlineUsers.get(data.targetUserId);
        if (targetSocketId) {
          io.to(targetSocketId).emit('notification', {
            ...data,
            timestamp: new Date(),
          });
        }
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.user) {
        onlineUsers.delete(socket.user._id.toString());
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        console.log(`❌ Socket disconnected: ${socket.user.name}`);
      }
    });
  });
};

module.exports = socketHandler;
