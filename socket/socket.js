const dataSockets = require("./dataSockets");

const activeUsers = {};

module.exports = (io) => {
  io.on("connection", async (socket) => {
    socket.on("register", async (appId) => {
     
      if (!activeUsers[appId]) {
        activeUsers[appId] = [];
      }

      activeUsers[appId].push(socket.id);
      
      io.to(appId).emit("activeUsers", activeUsers[appId]);

      socket.join(appId);
    });
     

    dataSockets(io, socket);

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
