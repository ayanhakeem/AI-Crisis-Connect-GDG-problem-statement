const onlineUsers = new Map(); // socketId -> { userId, name, department }

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins and registers themselves
    socket.on('user:join', (userData) => {
      if (!userData || !userData.userId) {
        console.warn('⚠️ Received user:join with invalid data');
        return;
      }

      onlineUsers.set(socket.id, {
        socketId: socket.id,
        userId: userData.userId,
        name: userData.name,
        department: userData.department,
        role: userData.role,
      });

      // Broadcast updated online users list
      io.emit('users:online', Array.from(onlineUsers.values()));
      console.log(`👤 ${userData.name} joined. Online: ${onlineUsers.size}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const user = onlineUsers.get(socket.id);
      onlineUsers.delete(socket.id);
      io.emit('users:online', Array.from(onlineUsers.values()));
      console.log(`❌ Socket disconnected: ${socket.id}. Online: ${onlineUsers.size}`);
    });
  });
};

module.exports = { initSocket };
