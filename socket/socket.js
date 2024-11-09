const { saveVisitor } = require("../services/appServices");
const dataSockets = require("./dataSockets");
const userSockets = require("./userSockets");

const activeUsers = {};

module.exports = (io) => {
  io.on("connection", async (socket) => {
    socket.on("register", async (data) => {
      try {
        if (!activeUsers[data.appId]) {
          activeUsers[data.appId] = [];
        }

        activeUsers[data.appId].push(socket.id);
        socket.join(data.appId);
        
        io.to(data.appId).emit("activeUsers", activeUsers[data.appId]?.length);

        saveVisitor(data);
      } catch (error) {
        console.log("🚀 ~ socket - register ~ error:", error);
        auditLogs.error("" || "User", "socket", "register", error);
        logger.error("" || "User", "socket", "register", error);
      }
    });

    dataSockets(io, socket);
    userSockets(io, socket, activeUsers);

    socket.on("disconnect", (appId) => {
      try {
        for (let appId in activeUsers) {
          activeUsers[appId] = activeUsers[appId].filter(
            (userId) => userId !== socket.id
          );

          io.to(appId).emit("activeUsers", activeUsers[appId]?.length);

          if (activeUsers[appId].length === 0) {
            delete activeUsers[appId];
          }
        }
      } catch (error) {
        console.log("🚀 ~ socket - disconnect ~ error:", error);
        auditLogs.error("" || "User", "socket", "disconnect", error);
        logger.error("" || "User", "socket", "disconnect", error);
      }
    });
  });
};
