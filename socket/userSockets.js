const auditLogs = require("../lib/auditLogs");
const CustomError = require("../lib/error");
const logger = require("../lib/logger/logger");
const Response = require("../lib/response");

module.exports = (io, socket, activeUsers) => {
  socket.on("getActiveUsers", async (appId) => {
    try {
      
      //console.log("🚀 ~ activeUsers:", activeUsers)
      io.to(appId).emit("activeUsers", activeUsers[appId]?.length);
    } catch (error) {
      console.log("🚀 ~ socket - getActiveUsers ~ error:", error);
      auditLogs.error("" || "User", "socket", "getActiveUsers", error);
      logger.error("" || "User", "socket", "getActiveUsers", error);
    }
  });

  socket.on("joinRoom", (appId) => {
    try {
      //console.log("🚀 ~ socket.on ~ appId:", appId)
      socket.join(appId);
    } catch (error) {
      console.log("🚀 ~ socket - joinRoom ~ error:", error);
      auditLogs.error("" || "User", "socket", "joinRoom", error);
      logger.error("" || "User", "socket", "joinRoom", error);
    }
  });

  socket.on("leaveRoom", (appId) => {
    try {
      socket.leave(appId);
    } catch (error) {
      console.log("🚀 ~ socket - leaveRoom ~ error:", error);
      auditLogs.error("" || "User", "socket", "leaveRoom", error);
      logger.error("" || "User", "socket", "leaveRoom", error);
    }
  });
};
