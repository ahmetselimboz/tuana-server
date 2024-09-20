const dataSockets = require("./dataSockets");
const userSockets = require("./userSockets");

const activeUsers = {};

module.exports = (io) => {
  io.on("connection", async (socket) => {
    socket.on("register", async (appId) => {
      if (!activeUsers[appId]) {
        activeUsers[appId] = [];
      }
      activeUsers[appId].push(socket.id);
      socket.join(appId);
      io.to(appId).emit("activeUsers", activeUsers[appId]);
     
    });

    dataSockets(io, socket);
    userSockets(io, socket, activeUsers);

    socket.on("disconnect", (appId) => {
      for (let appId in activeUsers) {
        activeUsers[appId] = activeUsers[appId].filter(
          (userId) => userId !== socket.id
        );

        // Güncel listeyi siteId odasına gönder
        io.to(appId).emit("activeUsers", activeUsers[appId]);

        // Eğer siteId'nin aktif kullanıcı listesi boşsa bu grubu kaldır
        if (activeUsers[appId].length === 0) {
          delete activeUsers[appId];
        }
      }
    });
  });
};
