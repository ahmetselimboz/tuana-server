
const connectedUsers = new Set();

module.exports = (io, socket) => {
  // socket.on('userOnline', (userId) => {
  //   console.log(`User ${userId} is online`);
  //   io.emit('userStatus', { userId, status: 'online' });
  // });

  // socket.on('userOffline', (userId) => {
  //   console.log(`User ${userId} is offline`);
  //   io.emit('userStatus', { userId, status: 'offline' });
  // });

  socket.on("register", () => {
    connectedUsers.add(socket.id);
    console.log(
      "A user connected. Total connected users:",
      connectedUsers.size
    );
  });

  socket.on("disconnect", async () => {
    connectedUsers.delete(socket.id);
    console.log(
      "A user disconnected. Total connected users:",
      connectedUsers.size
    );
  });
};
