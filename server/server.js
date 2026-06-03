require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const app = require('./app');
const connectDatabase = require('./config/database');
const config = require('./config');
const { User, Chat } = require('./models');
const chatService = require('./services/chat.service');

const onlineUsers = new Map();

const getOnlineUsersList = () => Array.from(onlineUsers.keys());

const broadcastOnlineUsers = () => {
  io.emit('online_users', getOnlineUsersList());
};

const getRecipientId = (chat, senderId) => {
  if (!chat) return null;
  const chatObj = chat.toObject ? chat.toObject() : chat;
  return chatObj.buyer.toString() === senderId.toString() ? chatObj.seller.toString() : chatObj.buyer.toString();
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.allowedOrigins,
    methods: ['GET', 'POST']
  }
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    const user = await User.findById(payload.userId).select('-passwordHash -refreshTokens');
    if (!user || !user.isActive) {
      return next(new Error('Unauthorized'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user.id.toString();
  const socketIds = onlineUsers.get(userId) || new Set();
  socketIds.add(socket.id);
  onlineUsers.set(userId, socketIds);
  socket.join(`user:${userId}`);
  broadcastOnlineUsers();

  socket.on('join_chat', async ({ chatId }) => {
    if (!chatId) return;
    socket.join(`chat:${chatId}`);
  });

  socket.on('send_message', async ({ chatId, content }) => {
    try {
      const message = await chatService.sendMessage(chatId, socket.user.id, content);
      const chat = await Chat.findById(chatId);
      const recipientId = getRecipientId(chat, socket.user.id);
      const payload = {
        ...message.toObject(),
        chatId,
        sender: socket.user.id,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      };
      io.to(`chat:${chatId}`).emit('message_received', payload);
      if (recipientId) {
        io.to(`user:${recipientId}`).emit('new_message', {
          chatId,
          message: payload,
          unreadCount: chat.unreadCount
        });
      }
      io.emit('chat_updated', {
        chatId,
        unreadCount: chat.unreadCount,
        lastMessageAt: chat.lastMessageAt
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('mark_read', async ({ chatId }) => {
    try {
      await chatService.markAsRead(chatId, socket.user.id);
      io.to(`chat:${chatId}`).emit('chat_read', { chatId, userId });
      io.emit('chat_updated', { chatId });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    const socketIds = onlineUsers.get(userId);
    if (socketIds) {
      socketIds.delete(socket.id);
      if (socketIds.size === 0) {
        onlineUsers.delete(userId);
      }
    }
    broadcastOnlineUsers();
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
